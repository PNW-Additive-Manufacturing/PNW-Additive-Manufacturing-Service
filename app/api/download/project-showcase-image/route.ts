import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { getModelPath, getProjectShowcaseImagePath } from "@/app/files";
import { retrieveSafeJWTPayload } from "../../util/JwtHelper";
import { AccountPermission } from "@/app/Types/Account/Account";
import ModelServe from "@/app/Types/Model/ModelServe";
import getConfig from "@/app/getConfig";

const envConfig = getConfig();

const projectShowcaseImageDownloadSchema = z.object({
	projectId: z.string().uuid()
});
export async function GET(request: NextRequest): Promise<NextResponse> {
	const parsedData = projectShowcaseImageDownloadSchema.safeParse({
		projectId: request.nextUrl.searchParams.get("projectId")
	});
	if (!parsedData.success) return new NextResponse(null, { status: 400 });

	const modelPath = await fs.promises.realpath(getProjectShowcaseImagePath(parsedData.data.projectId));
	if (!modelPath.startsWith(envConfig.uploadProjectShowcaseImageDir)) {
		return new NextResponse(null, { status: 404 });
	}

	try {
		const bufferedData = fs.readFileSync(modelPath);

		return new NextResponse(bufferedData as any, {
			headers: {
				"content-type": "image/jpg",
				"cache-control": "max-age=3600"
			}
		});
	}
	catch (ex) {
		return new NextResponse(null, { status: 404 });
	}
}
