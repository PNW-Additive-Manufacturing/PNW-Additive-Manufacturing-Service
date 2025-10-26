"use server";

import * as APIResponse from "@/app/api/APIResponse";
import { AccountPermission } from "@/app/Types/Account/Account";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { serveSession } from "@/app/utils/SessionUtils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestQuerySchema = z.object({
	accountEmail: z.email().optional(),
	requestedAfter: z.date().optional(),
	includeFulfilled: z.boolean().default(false),
	requestsPerPage: z.number().int().default(10),
	page: z.number().int().default(1)
});
export async function POST(request: NextRequest): Promise<NextResponse> {

	const session = await serveSession();

	if (!session.isSignedIn) throw new Error("JWT not found");

	const queryData = requestQuerySchema.safeParse(await request.json());
	if (!queryData.success)
		return new NextResponse(
			JSON.stringify(
				APIResponse.resError(
					`Query does not match the required Schema: ${queryData.error}`
				)
			),
			{ status: 404 }
		);

	if (queryData.data.accountEmail !== session.account.email && session.account.permission === AccountPermission.User) {
		// A regular user cannot access requests other than theirs!
		return new NextResponse(JSON.stringify(APIResponse.resUnauthorized()), {
			status: 401
		});
	}

	const requests = await RequestServe.query(queryData.data);
	return new NextResponse(
		JSON.stringify(APIResponse.resOkData({ requests: requests })),
		{
			status: 200
		}
	);
}
