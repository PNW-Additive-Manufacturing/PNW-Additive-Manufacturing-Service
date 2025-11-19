"use server";

import { resError, resUnauthorized } from "@/app/api/APIResponse";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import * as PDF from "ams-pdf";
import MemoryStream from "memorystream";
import { NextRequest, NextResponse } from "next/server";
import "server-only";

const appConfig = getConfig();

export async function GET(request: NextRequest): Promise<NextResponse> {

    let accountJWT = await retrieveSafeJWTPayload();
    if (accountJWT == undefined) {
        // return NextResponse.json(resError("You must be signed in!"));
        return NextResponse.redirect(appConfig.joinHostURL("/user/login"));
    }

    // Lazy, we need to conform the JWT parsing as a Account type in the future.
    const account = (await AccountServe.queryByEmail(accountJWT.email))!;

    const transactionId = request.nextUrl.searchParams.get("transactionId");
    if (transactionId == undefined) {
        return NextResponse.json(resError("Include transactionId search parameter!"));
    }

    const transaction = await AccountServe.queryTransaction(transactionId);
    if (transaction == undefined) {
        return NextResponse.redirect(appConfig.joinHostURL("/not-found"));
    }

    // Account does not match with requested transaction AND they are not an elevated user.
    if (transaction.accountEmail != accountJWT.email && accountJWT.permission == AccountPermission.User) {
        return NextResponse.json(resUnauthorized());
    }

    const stream = new MemoryStream();

    await PDF.makeQuotePDF({

        contact: {
            name: `${account.firstName} ${account.lastName}`,
            email: account.email
        },
        feesCostInCents: transaction.feesInCents,
        items: [
            {
                name: "PNW Additive Manufacturing Service Deposit",
                discountPercent: 0,
                quantity: 1,
                taxInCents: 0,
                unitCostInCents: transaction.amountInCents
            }
        ],
        quoteNumber: `W${transaction.id}`,
        payment: transaction.paidAt ? { paidAt: transaction.paidAt, paymentMethod: transaction.paymentMethod.toUpperCase() } : undefined,

    }, stream);

    return new NextResponse(stream as any, {
        headers: {
            "Content-Disposition": `attachment; filename="ams_receipt_${transaction.id}.pdf"`,
            "content-type": "application/octet-stream"
        }
    });
}