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

const envConfig = getConfig();

export async function middleware(request: NextRequest) {
	const nextUrl = request.nextUrl.pathname;
	
	//allow non-logged in users to access login and create account screens
	if (
		nextUrl.startsWith("/api/hooks/stripe") ||
		nextUrl.startsWith("/favicon.ico") ||
		nextUrl.startsWith("/robots.txt") ||
		nextUrl.startsWith("/materials") ||
		nextUrl.startsWith("/user/login") ||
		nextUrl.startsWith("/not-found") ||
		nextUrl.startsWith("/user/create-account") ||
		nextUrl.startsWith("/user/forgot-password") ||
		nextUrl.startsWith("/user/banned") ||
		nextUrl.startsWith("/user/verify-email") ||
		nextUrl.startsWith("/user/reset-password") ||
		nextUrl.startsWith("/user/email-verified") ||
		nextUrl.startsWith("/schedule") ||
		nextUrl.startsWith("/team") ||
		nextUrl.startsWith("/user/current") ||
		nextUrl.startsWith("/assets") ||
		nextUrl.startsWith("/_next") ||
		nextUrl === "/"
	) {
		return NextResponse.next();
	}	
	
	//because this is the only way NextJS will allow me to delete cookies before
	//a GET request to /logout is completed, the logout feature is here.
	//I could use an API endpoint, but I would prefer to not have both /logout and /api/logout routes
	if (nextUrl.startsWith("/user/logout")) {
		let res = NextResponse.redirect(envConfig.hostURL);
		// Delete session cookie from response.
		res.cookies.delete(envConfig.sessionCookie);
		
		return res;
	}

	try
	{
		const sessionUpdate = (await fetch(envConfig.joinHostURL("/user/current"), { headers: headers(), method: "GET", cache: "no-cache" }))?.headers?.getSetCookie()?.at(0);
	
		if (sessionUpdate)
		{	
			console.log("Updated session token!");			

			// Redirect to the current page with new cookies to respect middleware.
			const res = NextResponse.redirect(envConfig.joinHostURL(nextUrl));
			res.headers.set("Set-Cookie", sessionUpdate);
			return res;
		}
	}
	catch (sessionUpdateError)
	{
		console.error("Failed to fetch new session information!", sessionUpdateError);
	}

	//check if JWT exists and is valid
	let jwtPayload: UserJWT;
	try 
	{
		jwtPayload = await getJwtPayload();

		if (jwtPayload == null) throw new Error("No JWT Exists");
	} 
	catch (e) 
	{
		return NextResponse.redirect(envConfig.joinHostURL("/user/login"));
	}

	// if (jwtPayload.isBanned && !(nextUrl.startsWith("/user/profile") && request.method == "GET"))
	if (jwtPayload.isBanned)
	{
		// User is not longer able to access the Additive Manufacturing Service.
		return NextResponse.redirect(envConfig.joinHostURL("/user/banned"));
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
