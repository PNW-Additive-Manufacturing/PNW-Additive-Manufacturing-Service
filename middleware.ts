"use server";

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import getConfig from "./app/getConfig";
import { SESSION_COOKIE } from "./app/api/util/Constants";
import { AccountPermission } from "./app/Types/Account/Account";
import { getJwtPayload, UserJWT } from "./app/api/util/JwtHelper";
import farmMiddleware from "./app/api/farm/middleware";
import modelDownloadMiddleware from "./app/api/download/model/middleware";

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
		nextUrl.startsWith("/user/reset-password") ||
		nextUrl.startsWith("/schedule") ||
		nextUrl.startsWith("/team") ||
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
		res.cookies.delete(SESSION_COOKIE);

		return res;
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
