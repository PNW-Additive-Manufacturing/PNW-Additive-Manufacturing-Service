import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { getModelPath, getProjectShowcaseImagePath } from "@/app/files";
import { retrieveSafeJWTPayload } from "../../util/JwtHelper";
import { AccountPermission } from "@/app/Types/Account/Account";
import ModelServe from "@/app/Types/Model/ModelServe";

const projectShowcaseImageDownloadSchema = z.object({
	projectId: z.string().uuid()
});
export async function GET(request: NextRequest): Promise<NextResponse> {
	const parsedData = projectShowcaseImageDownloadSchema.safeParse({
		projectId: request.nextUrl.searchParams.get("projectId")
	});
	if (!parsedData.success) return new NextResponse(null, { status: 400 });

	const modelPath = getProjectShowcaseImagePath(parsedData.data.projectId);

	console.log(
		`Downloading showcase ${parsedData.data.projectId} from ${modelPath}`
	);

	if (!fs.existsSync(modelPath)) return new NextResponse("Not Found", { status: 404 });

	const bufferedData = fs.readFileSync(modelPath);

	return new NextResponse(bufferedData, {
		headers: {
			"content-type": "image/jpg",
            "cache-control": "max-age=3600" 
		}
	});
}
