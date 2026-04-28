import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import farmMiddleware from "./app/api/farm/middleware";
import getConfig from "./app/getConfig";

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
	"/assets",
	"/_next",
];

function isPublicPath(pathname: string) {
	return pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Public paths - allow through without auth
	if (isPublicPath(pathname)) return NextResponse.next();

	// Farm API uses its own validation middleware
	if (pathname.startsWith("/api/farm")) return farmMiddleware(request);

	// Logout: clear session and redirect home
	if (pathname.startsWith("/user/logout")) {
		const res = NextResponse.redirect(envConfig.hostURL);
		res.cookies.delete(envConfig.sessionCookie);
		return res;
	}

	// All other routes: allow through, they will validate auth using serve* helpers
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - _next/data (data prerendering)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
