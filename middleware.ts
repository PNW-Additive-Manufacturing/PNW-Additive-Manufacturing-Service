"use server";

import "server-only";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import getConfig from "./app/getConfig";
import { AccountPermission } from "./app/Types/Account/Account";
import { getJwtPayload, UserJWT } from "./app/api/util/JwtHelper";
import farmMiddleware from "./app/api/farm/middleware";
import modelDownloadMiddleware from "./app/api/download/model/middleware";
import { cookies, headers } from "next/headers";

//all root level files allowed to be accessed without logging in
const ROOT_FOLDER_FILE_WHITELIST = ["/favicon.ico", "/robots.txt"];

const USER_BLACKLIST = ["/api"];

const envConfig = getConfig();

export async function middleware(request: NextRequest) {
	const nextUrl = request.nextUrl.pathname;

	if (nextUrl.startsWith("/api/hooks/stripe")) {
		return NextResponse.next();
	}

	//allow non-logged in users to access login and create account screens
	if (
		nextUrl.startsWith("/user/login") ||
		nextUrl.startsWith("/user/create-account") ||
		nextUrl.startsWith("/user/forgot-password") ||
		nextUrl.startsWith("/user/verify-email") ||
		nextUrl.startsWith("/user/reset-password") ||
		nextUrl.startsWith("/schedule") ||
		nextUrl.startsWith("/team") ||
		nextUrl.startsWith("/user/current") ||
		nextUrl === "/"
	) {
		return NextResponse.next();
	}	

	//because this is the only way NextJS will allow me to delete cookies before
	//a GET request to /logout is completed, the logout feature is here.
	//I could use an API endpoint, but I would prefer to not have both /logout and /api/logout routes
	if (nextUrl.startsWith("/user/logout")) {
		// cookies().delete(SESSION_COOKIE);
		const newPath = request.nextUrl.clone();
		newPath.pathname = "/user/login";

		let res = NextResponse.redirect(newPath);
		//delete session cookie from response.
		res.cookies.delete(envConfig.sessionCookie);

		return res;
	}

	if (nextUrl.indexOf(".") == -1 && request.method == "GET")
	{
		const sessionUpdate = (await fetch(envConfig.joinHostURL("/user/current"), { headers: headers() }))?.headers?.getSetCookie()?.at(0);
	
		if (sessionUpdate)
		{	
			// Redirect to the current page with new cookies to respect middleware.
			const res = NextResponse.redirect(envConfig.joinHostURL(nextUrl));
			res.headers.set("Set-Cookie", sessionUpdate);
			return res;
		}
	}

	//all assets, nextjs stuff, are allowed
	if (nextUrl.startsWith("/assets") || nextUrl.startsWith("/_next")) {
		return NextResponse.next();
	}

	//all whitelisted files in root folder are allowed
	if (ROOT_FOLDER_FILE_WHITELIST.find((item) => item == nextUrl)) {
		return NextResponse.next();
	}

	//check if JWT exists and is valid
	let jwtPayload: UserJWT;
	try {
		jwtPayload = await getJwtPayload();
		if (jwtPayload == null) {
			throw new Error("No JWT Exists");
		}
	} catch (e) {
		console.log(e);
		//if JWT does not exist or is invalid
		return NextResponse.redirect(envConfig.joinHostURL("/user/login"));
	}

	// 	// Update the JWT if required. 
	// // I actually have zero clue why I couldn't just do this in middleware.
	// // It's an issue with the Edge Runtime and unsupported NodeJS libraries required by postgres.js.
	// // This should only be a HOT FIX until we can figure something out. 
	// if (jwtPayload != null) {
	// 	const JWTChanges = (await db`SELECT * FROM Account WHERE Permission != ${jwtPayload.permission} OR IsEmailVerified != ${jwtPayload.isemailverified}`).at(0);
	// 	if (JWTChanges != null) {
	// 		console.log("Changes detected!", JWTChanges);

	// 		await login(JWTChanges.email, JWTChanges.permission, JWTChanges.firstname, JWTChanges.lastname, JWTChanges.isemailverified);
	// 	}
	// }

	if (
		nextUrl.startsWith("/experiments") &&
		jwtPayload.permission == AccountPermission.User
	) {
		return NextResponse.redirect(envConfig.joinHostURL("/not-found"));
	}

	let permission = jwtPayload.permission as AccountPermission;

	// const account = await AccountServe.queryByEmail(jwtPayload.email)!;
	// if (account == undefined)
	// {
	// 	await logout();
	// 	return NextResponse.redirect(new URL("", request.url));
	// }

	// TODO: CHECK IF BLACKLISTED
	if (!jwtPayload.isemailverified) {
		if (
			nextUrl.startsWith("/user/verify-email") ||
			nextUrl.startsWith("/user/not-verified") ||
			nextUrl.startsWith("/user/profile")
		) {
			// Allow these pages
		} else {
			return NextResponse.redirect(
				envConfig.joinHostURL(`/user/not-verified`)
			);
		}
	} else if (
		nextUrl.startsWith("/user/not-verified") ||
		nextUrl.startsWith("/user/verify-email")
	) {
		return NextResponse.redirect(envConfig.hostURL);
	}

	//automatically force redirect to correct dashboard
	if (
		nextUrl.startsWith(`/dashboard/${AccountPermission.Maintainer}`) &&
		permission == AccountPermission.User
	) {
		return NextResponse.redirect(
			envConfig.joinHostURL(`/dashboard/${AccountPermission.User}`)
		);
	}

	//automatically force redirect to correct dashboard
	if (
		(nextUrl.startsWith(`/dashboard/maintainer/printers`) ||
			nextUrl.startsWith(`/dashboard/maintainer/users`)) &&
		permission !== AccountPermission.Admin
	) {
		return NextResponse.redirect(
			envConfig.joinHostURL(`/dashboard/${permission}`)
		);
	}

	if (nextUrl.startsWith("/download/model"))
		return modelDownloadMiddleware(request);

	if (nextUrl.startsWith("/api/farm")) return farmMiddleware(request);

	return NextResponse.next();
}
