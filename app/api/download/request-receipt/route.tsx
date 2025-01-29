"use server";

import "server-only";
import { resError, resUnauthorized } from "@/app/api/APIResponse";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission } from "@/app/Types/Account/Account";
import { renderToBuffer, renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { RequestReceiptPDF } from "@/app/PDFs/RequestReceipt";
import { RequestServe } from "@/app/Types/Request/RequestServe";

const appConfig = getConfig();

export async function GET(req: NextRequest): Promise<NextResponse> {
    let accountJWT = await retrieveSafeJWTPayload();
    if (accountJWT == undefined) {
        // return NextResponse.json(resError("You must be signed in!"));
        return NextResponse.redirect(appConfig.joinHostURL("/user/login"));
    }

    // Lazy, we need to conform the JWT parsing as a Account type in the future.
    // const account = (await AccountServe.queryByEmail(accountJWT.email))!;

    const requestId = req.nextUrl.searchParams.get("requestId");
    if (requestId == undefined) {
        return NextResponse.json(resError("Include requestId search parameter!"));
    }

    const request = await RequestServe.fetchByIDWithAll(requestId);
    if (request == undefined) {
        return NextResponse.redirect(appConfig.joinHostURL("/not-found"));
    }

    // Account does not match with requested transaction AND they are not an elevated user.
    if (request.requesterEmail != accountJWT.email && accountJWT.permission == AccountPermission.User) {
        return NextResponse.json(resUnauthorized());
    }

    console.log(request);

    const receiptPDF = await renderToBuffer(<RequestReceiptPDF request={request} />);

    return new NextResponse(receiptPDF, {
        headers: {
            "Content-Disposition": `attachment; filename="ams_request_receipt_${requestId}.pdf"`,
            "content-type": "application/octet-stream"
        }
    });
}