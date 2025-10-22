// (Edge runtime)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import getConfig from "./app/getConfig";
import { AccountPermission } from "./app/Types/Account/Account";
import { getJwtPayload, type UserJWT } from "./app/api/util/JwtHelper";
import farmMiddleware from "./app/api/farm/middleware";

const envConfig = getConfig();

const PUBLIC_PREFIXES = [
	"/api/hooks/stripe",
	"/favicon.ico",
	"/robots.txt",
	"/materials",
	"/user/login",
	"/api/login",
	"/not-found",
	"/user/create-account",
	"/user/forgot-password",
	"/user/banned",
	"/user/verify-email",
	"/user/reset-password",
	"/user/email-verified",
	"/project-spotlight/",
	"/api/download/project-showcase-image",
	"/schedule",
	"/team",
	"/user/current",
	"/assets",
	"/_next",
];

function isPublicPath(pathname: string) {
	return pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isMaintainerAdminSection(pathname: string) {
	return (
		pathname.startsWith("/dashboard/maintainer/printers") ||
		pathname.startsWith("/dashboard/maintainer/users") ||
		pathname.startsWith("/dashboard/maintainer/accounting") ||
		pathname.startsWith("/dashboard/maintainer/reregistration")
	);
}

function redirectTo(url: string) {
	return NextResponse.redirect(envConfig.joinHostURL(url));
}

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Public paths
	if (isPublicPath(pathname)) return NextResponse.next();

	// Farm API delegates to its own middleware
	if (pathname.startsWith("/api/farm")) return farmMiddleware(request);

	// Logout: clear session then send home
	if (pathname.startsWith("/user/logout")) {
		const res = NextResponse.redirect(envConfig.hostURL);
		res.cookies.delete(envConfig.sessionCookie);
		return res;
	}

	// Session sync and reregistration gate
	try {
		// Forward incoming cookies to the server so it can refresh session if needed
		const cookieHeader = request.headers.get("cookie") ?? "";
		const current = await fetch(envConfig.joinHostURL("/user/current"), {
			headers: { cookie: cookieHeader },
			method: "GET",
			cache: "no-store",
		});

		if (current.status !== 200) {
			throw new Error("Failed to refresh account/session state.");
		}

		// If server issued a new session cookie, replay the request with it
		const setCookie = current.headers.getSetCookie()?.at(0);
		if (setCookie) {
			const res = NextResponse.redirect(envConfig.joinHostURL(pathname));
			res.headers.set("Set-Cookie", setCookie);
			return res;
		}

		const json = await current.json();

		// If server requires re-registration, hard-gate here
		if (typeof json?.reregistration === "string" && !pathname.startsWith("/user/reregistration/")) {
			return redirectTo(`/user/reregistration/${json.reregistration}`);
		}

	} catch (err) {
		console.error(err);
		const res = NextResponse.redirect(
			envConfig.joinHostURL(`/user/login?redirect=${encodeURIComponent(envConfig.joinHostURL(pathname).toString())}&reason=Your session has been invalidated.`)
		);
		res.cookies.delete(envConfig.sessionCookie);
		return res;
	}

	// AuthZ: require valid JWT
	let jwt: UserJWT;
	try {
		jwt = await getJwtPayload();
		if (!jwt) throw new Error("Missing JWT");
	} catch {
		return redirectTo("/user/login");
	}

	// Ban gate (no exceptions)
	if (jwt.isBanned) {
		return redirectTo("/user/banned");
	}

	// Experiments: only non-basic roles
	if (pathname.startsWith("/experiments") && jwt.permission !== AccountPermission.Admin) {
		return redirectTo("/not-found");
	}

	// Email verification gate (allow-list a few pages)
	const isVerificationRoute =
		pathname.startsWith("/user/verify-email") ||
		pathname.startsWith("/user/not-verified") ||
		pathname.startsWith("/user/profile");

	if (!jwt.isemailverified) {
		if (!isVerificationRoute) {
			return redirectTo("/user/not-verified");
		}
	} else if (
		pathname.startsWith("/user/not-verified") ||
		pathname.startsWith("/user/verify-email")
	) {
		return NextResponse.redirect(envConfig.hostURL);
	}

	// Normalize dashboard landing by role
	if (
		pathname.startsWith(`/dashboard/${AccountPermission.Maintainer}`) &&
		jwt.permission === AccountPermission.User
	) {
		return redirectTo(`/dashboard/${AccountPermission.User}`);
	}

	// Maintainer/Admin sections must not be accessed by plain users
	if (isMaintainerAdminSection(pathname) && jwt.permission !== AccountPermission.Admin) {
		return redirectTo(`/dashboard/${jwt.permission}`);
	}

	return NextResponse.next();
}
