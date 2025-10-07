// PART MODELS WILL BE SERVED USING THIS ROUTE

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { getModelPath } from "@/app/files";
import AccountServe from "@/app/Types/Account/AccountServe";
import { getJwtPayload, retrieveSafeJWTPayload } from "../../util/JwtHelper";
import { redirect } from "next/navigation";
import Account, { AccountPermission } from "@/app/Types/Account/Account";
import ModelServe from "@/app/Types/Model/ModelServe";

const modelDownloadSchema = z.object({
	modelId: z.string().uuid()
});
export async function GET(request: NextRequest): Promise<NextResponse> {
	let JWT = await retrieveSafeJWTPayload();
	if (JWT == undefined) throw new Error("JWT not found");

	const parsedData = modelDownloadSchema.safeParse({
		modelId: request.nextUrl.searchParams.get("modelId")
	});
	if (!parsedData.success) return new NextResponse(null, { status: 400 });

	const model = await ModelServe.queryById(parsedData.data!.modelId);
	if (model == undefined) return new NextResponse(null, { status: 404 });

	const isOwner = model.ownerEmail == JWT.email;

	if (!isOwner && JWT.permission == AccountPermission.User) {
		// User does not have permission to access this resource!
		return new NextResponse("Not Authenticated", { status: 403 });
	}

	const modelPath = getModelPath(model.ownerEmail, parsedData.data.modelId);

	console.log(
		`Downloading model ${parsedData.data.modelId} by ${model.ownerEmail} from ${modelPath}`
	);

	// if (!fs.promises.access(modelPath, fs.promises.constants.F_OK)) {
	// 	return new NextResponse("Not Found", { status: 404 });
	// }

	const bufferedData = await fs.promises.readFile(modelPath);

	return new NextResponse(bufferedData as any, {
		headers: {
			"Content-Disposition": `attachment; filename="${model.name}.stl"`,
			"content-type": "application/octet-stream",
			"Cache-Control": "public, max-age=2592000, immutable"
		}
	});
}
