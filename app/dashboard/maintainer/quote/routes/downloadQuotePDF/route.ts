import { AccountPermission } from "@/app/Types/Account/Account";
import { serveSession } from "@/app/utils/SessionUtils";
import { makeQuotePDF, QuoteSchema } from "ams-pdf";
import MemoryStream from "memorystream";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {

    await serveSession({
        requiredPermission: AccountPermission.Maintainer,
        unauthorizedBehavior: "redirect"
    });

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