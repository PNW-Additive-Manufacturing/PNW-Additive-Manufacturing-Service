"use server";

import { resError, resUnauthorized } from "@/app/api/APIResponse";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission } from "@/app/Types/Account/Account";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import * as PDF from "ams-pdf";
import MemoryStream from "memorystream";
import { NextRequest, NextResponse } from "next/server";
import "server-only";

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

    if (!request.quote) return NextResponse.json(resError("Request has not been quoted!"));

    const stream = new MemoryStream();

    await PDF.makeQuotePDF({

        // TODO: Preparer should be whoever assigned the quote!
        preparedAt: request.submitTime,
        contact: {
            name: `${request.firstName} ${request.lastName}`,
            email: request.requesterEmail
        },
        feesCostInCents: request.quote.feesInCents,
        items: request.parts.map(p => ({
            name: p.model.name,
            discountPercent: 0,
            quantity: p.quantity,
            taxInCents: 0,
            unitCostInCents: (p.priceInDollars ?? 0) * 100,
        })),
        quoteNumber: `R${request.id}`,
        payment: request.quote.isPaid ? { paidAt: request.quote.paidAt, paymentMethod: "AMS Wallet" } : undefined,

    }, stream);
    
    return new NextResponse(stream as any, {
        headers: {
            "Content-Disposition": `attachment; filename="ams_request_receipt_${requestId}.pdf"`,
            "content-type": "application/octet-stream"
        }
    });
}