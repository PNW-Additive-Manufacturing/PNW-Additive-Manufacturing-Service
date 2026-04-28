import { getProjectShowcaseImagePath } from "@/app/files";
import getConfig from "@/app/getConfig";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

const envConfig = getConfig();

const projectShowcaseImageDownloadSchema = z.object({
	projectId: z.string().uuid(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const parsedData = projectShowcaseImageDownloadSchema.safeParse({
			projectId: request.nextUrl.searchParams.get("projectId"),
		});

		if (!parsedData.success) {
			return new NextResponse(null, { status: 400 });
		}

		const imagePath = getProjectShowcaseImagePath(parsedData.data.projectId);
		const resolvedPath = await fs.promises.realpath(imagePath);

		// Security: Ensure the resolved path is within the upload directory
		const uploadDir = await fs.promises.realpath(envConfig.uploadProjectShowcaseImageDir);
		if (!resolvedPath.startsWith(uploadDir + path.sep) && resolvedPath !== uploadDir) {
			return new NextResponse(null, { status: 404 });
		}

		// Check if file exists before reading
		const fileStats = await fs.promises.stat(resolvedPath);
		if (!fileStats.isFile()) {
			return new NextResponse(null, { status: 404 });
		}

		const bufferedData = await fs.promises.readFile(resolvedPath);

		return new NextResponse(bufferedData, {
			headers: {
				"content-type": "image/jpeg",
				"cache-control": "public, max-age=3600, immutable",
				"content-length": bufferedData.length.toString(),
			},
		});
	} catch (error) {
		console.error("[project-showcase-image] Error:", {
			error: error instanceof Error ? error.message : String(error),
			projectId: request.nextUrl.searchParams.get("projectId"),
		});
		return new NextResponse(null, { status: 404 });
	}
}
