import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { getProjectShowcaseAttachmentPath } from "@/app/files";
import getConfig from "@/app/getConfig";

const envConfig = getConfig();

const projectShowcaseAttachmentDownloadSchema = z.object({
    attachmentId: z.string().uuid()
});
export async function GET(request: NextRequest): Promise<NextResponse> {
    const parsedData = projectShowcaseAttachmentDownloadSchema.safeParse({
        attachmentId: request.nextUrl.searchParams.get("attachmentId")
    });
    if (!parsedData.success) return new NextResponse(null, { status: 400 });

    const attachmentPath = await fs.promises.realpath(getProjectShowcaseAttachmentPath(parsedData.data.attachmentId));
    if (!attachmentPath.startsWith(envConfig.uploadProjectShowcaseAttachmentsDir)) {
        return new NextResponse(null, { status: 404 });
    }

    try {
        const bufferedData = fs.readFileSync(attachmentPath);

        return new NextResponse(bufferedData as any, {
            headers: {
                "cache-control": "max-age=3600"
            }
        });
    }
    catch (ex) {
        return new NextResponse(null, { status: 404 });
    }

}
