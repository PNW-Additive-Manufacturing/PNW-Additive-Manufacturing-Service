import { getProjectShowcaseImagePath } from "@/app/files";
import getConfig from "@/app/getConfig";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

	try {
		const bufferedData = fs.readFileSync(modelPath);

		console.log(bufferedData);

		return new NextResponse(bufferedData as any, {
			headers: {
				"content-type": "image/jpg",
				"cache-control": "max-age=3600"
			}
		});
	}
	catch (ex) {
		console.error(ex);
		return new NextResponse(null, { status: 404 });
	}
}
