"use server";

import { resError, resUnauthorized } from "@/app/api/APIResponse";
import getConfig from "@/app/getConfig";
import { WalletTransactionReceiptPDF } from "@/app/PDFs/WalletReceipt";
import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import "server-only";

const appConfig = getConfig();

export async function GET(request: NextRequest): Promise<NextResponse> {

    const session = await serveRequiredSession();

    // Lazy, we need to conform the JWT parsing as a Account type in the future.
    const account = (await AccountServe.queryByEmail(session.account.email))!;

    const transactionId = request.nextUrl.searchParams.get("transactionId");
    if (transactionId == undefined) {
        return NextResponse.json(resError("Include transactionId search parameter!"));
    }

    const transaction = await AccountServe.queryTransaction(transactionId);
    if (transaction == undefined) {
        return NextResponse.redirect(appConfig.joinHostURL("/not-found"));
    }

    // Account does not match with requested transaction AND they are not an elevated user.
    if (transaction.accountEmail != session.account.email && session.account.permission == AccountPermission.User) {
        return NextResponse.json(resUnauthorized());
    }

    const receiptPDF = await renderToBuffer(<WalletTransactionReceiptPDF transaction={Object.assign(transaction, account)} />);

    return new NextResponse(receiptPDF as any, {
        headers: {
            "Content-Disposition": `attachment; filename="ams_receipt_${transaction.id}.pdf"`,
            "content-type": "application/octet-stream"
        }
    });
}