"use server";

import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import AccountServe from "@/app/Types/Account/AccountServe";
import { NextRequest, NextResponse } from "next/server";

export default async function modelDownloadMiddleware(
	request: NextRequest
): Promise<NextResponse> {
	// const jwtPayload = await retrieveSafeJWTPayload();

	return NextResponse.next();
}
