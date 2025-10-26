// (Edge runtime)

import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
	
	const pathname = request.nextUrl.pathname;

	const response = NextResponse.next();
	response.headers.set("x-current-path", pathname);

	return response;
}
