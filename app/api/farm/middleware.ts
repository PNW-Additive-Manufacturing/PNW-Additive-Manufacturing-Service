"use server";

import { serveOptionalSession } from "@/app/api/util/SessionHelper";
import { AccountPermission } from "@/app/Types/Account/Account";
import { NextRequest, NextResponse } from "next/server";
import { resUnauthorized } from "../APIResponse";

export default async function farmMiddleware(
	request: NextRequest
): Promise<Response> {
	const jwtPayload = await serveOptionalSession();
	// Maintainer or above can access the FarmAPI mirror!
	if (jwtPayload == null || jwtPayload.permission == AccountPermission.User)
		return NextResponse.json(resUnauthorized(), { status: 401 });

	return NextResponse.next();
}
