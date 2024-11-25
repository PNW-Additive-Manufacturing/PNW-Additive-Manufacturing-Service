"use server";

import "server-only";
import { resError, resUnauthorized } from "@/app/api/APIResponse";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { WalletTransactionReceiptPDF } from "@/app/PDFs/Receipt";
import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import { renderToBuffer, renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

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

    const receiptPDF = await renderToBuffer(<WalletTransactionReceiptPDF transaction={Object.assign(transaction, account)} />);

    return new NextResponse(receiptPDF, {
        headers: {
            "Content-Disposition": `attachment; filename="ams_receipt_${transaction.id}.pdf"`,
            "content-type": "application/octet-stream"
        }
    });
}