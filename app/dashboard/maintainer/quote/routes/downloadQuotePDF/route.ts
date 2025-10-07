import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { makeQuotePDF, makeReceiptPDF, QuoteSchema } from "ams-pdf";
import MemoryStream from "memorystream";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission } from "@/app/Types/Account/Account";

const appConfig = getConfig();

export async function POST(req: NextRequest): Promise<NextResponse> {
    let accountJWT = await retrieveSafeJWTPayload();
    if (!accountJWT || accountJWT.permission === AccountPermission.User) {
        return NextResponse.redirect(appConfig.joinHostURL("/user/login"));
    }

    const content = await req.text();

    const quote = QuoteSchema.parse(JSON.parse(content));

    const generatedPDF = new MemoryStream();

    const beganAt = Date.now();

    await makeQuotePDF(quote, generatedPDF);

    const endedAt = Date.now();

    console.log("PDF Generation Time", (endedAt - beganAt), "ms");

    return new NextResponse(generatedPDF as any, {
        headers: {
            "Content-Disposition": `attachment; filename="quote.pdf"`,
            "content-type": "application/pdf"
        }
    });
}