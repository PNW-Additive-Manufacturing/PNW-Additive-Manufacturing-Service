"use server";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { getModelPath } from "@/app/files";
import AccountServe from "@/app/Types/Account/AccountServe";
import { redirect } from "next/navigation";
import Account, { AccountPermission } from "@/app/Types/Account/Account";
import ModelServe from "@/app/Types/Model/ModelServe";
import { retrieveSafeJWTPayload } from "../util/JwtHelper";
import * as APIResponse from "@/app/api/APIResponse";
import { RequestQuery, RequestServe } from "@/app/Types/Request/RequestServe";

const requestQuerySchema = z.object({
	accountEmail: z.string().email().optional(),
	requestedAfter: z.date().optional(),
	includeFulfilled: z.boolean().default(false),
	requestsPerPage: z.number().int().default(10),
	page: z.number().int().default(1)
});
export async function POST(request: NextRequest): Promise<NextResponse> {
	const JWT = await retrieveSafeJWTPayload();
	if (JWT === null) throw new Error("JWT not found");

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

	if (
		queryData.data.accountEmail !== JWT.email &&
		JWT.permission === AccountPermission.User
	) {
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
