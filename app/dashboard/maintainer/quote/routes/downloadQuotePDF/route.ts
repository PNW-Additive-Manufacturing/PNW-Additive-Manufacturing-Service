import { serveRequiredSession } from "@/app/api/util/SessionHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission } from "@/app/Types/Account/Account";
import { makeQuotePDF, QuoteSchema } from "ams-pdf";
import MemoryStream from "memorystream";
import { NextRequest, NextResponse } from "next/server";
import "server-only";

const appConfig = getConfig();

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const accountJWT = await serveRequiredSession();
        if (accountJWT.permission === AccountPermission.User) {
            return NextResponse.redirect(appConfig.joinHostURL("/user/login"));
        }
    } catch (error) {
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