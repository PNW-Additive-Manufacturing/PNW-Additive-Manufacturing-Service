"use server";

import { NextRequest, NextResponse } from "next/server";

export default async function modelDownloadMiddleware(
	request: NextRequest
): Promise<NextResponse> {
	// const jwtPayload = await serveOptionalSession();

	return NextResponse.next();
}
