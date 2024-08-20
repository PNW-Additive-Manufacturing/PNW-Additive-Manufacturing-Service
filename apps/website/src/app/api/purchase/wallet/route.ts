"use server";

import {
	IsPayingWithStripe,
	WalletTransaction,
	WalletTransactionPaymentMethod,
	WalletTransactionStatus
} from "@/app/Types/Account/Wallet";
import db from "@/app/api/Database";
import { NextRequest, NextResponse } from "next/server";
import ActionResponse from "../../server-actions/ActionResponse";
import { getJwtPayload } from "../../util/JwtHelper";
import { z } from "zod";
import AccountServe from "@/app/Types/Account/AccountServe";
import Stripe from "stripe";
import { useDebugValue } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import getConfig from "@/app/getConfig";

const envConfig = getConfig();
const stripe = new Stripe(envConfig.stripeAPIKey);

const purchaseBalanceSchema = z.object({
	paymentMethod: z.nativeEnum(WalletTransactionPaymentMethod),
	amountInCents: z.coerce.number().int()
});
export async function GET(request: NextRequest): Promise<NextResponse> {
	const JWT = await getJwtPayload();

	const account = (await AccountServe.queryByEmail(JWT.email))!;
	const pendingTransaction = await AccountServe.queryPendingTransaction(
		account!.email
	);
	const hasPreviousTransaction = pendingTransaction != undefined;

	// Step 1: Check if an existing transaction is still live. And delete!
	if (hasPreviousTransaction) {
		if (
			pendingTransaction.paymentMethod ==
			WalletTransactionPaymentMethod.Stripe
		) {
			const stripeTransaction = await stripe.checkout.sessions.retrieve(
				pendingTransaction.stripeCheckoutId!
			);

			if (
				stripeTransaction.status == "expired" &&
				stripeTransaction.payment_status == "unpaid"
			) {
				await AccountServe.markTransactionCancelled(
					pendingTransaction.stripeCheckoutId!
				);
				redirect("/");
			}

			switch (stripeTransaction.payment_status) {
				case "paid":
					// We have a problem. It wasn't marked as paid!
					await AccountServe.markTransactionComplete(
						pendingTransaction.stripeCheckoutId!
					);
					redirect("/");
				case "unpaid":
					console.log(stripeTransaction);
					return NextResponse.redirect(
						stripeTransaction.url!.toString()
					);
			}
		} else {
			throw new TypeError("Unsupported payment method!");
		}
	}

	const parsedData = purchaseBalanceSchema.safeParse({
		paymentMethod: request.nextUrl.searchParams.get("paymentMethod"),
		amountInCents: request.nextUrl.searchParams.get("amountInCents")
	});
	if (!parsedData.success)
		return NextResponse.json(
			ActionResponse.Error(`Schema Failed: ${parsedData.error.message}`)
		);

	// console.log(
	// 	`Purchasing \$${(parsedData.data.amountInCents / 100).toFixed(
	// 		2
	// 	)} through ${parsedData.data.paymentMethod.toUpperCase()}`
	// );

	const isPaymentMethodStripe =
		parsedData.data.paymentMethod == WalletTransactionPaymentMethod.Stripe;

	if (isPaymentMethodStripe) {
		const checkoutUrl = await db.begin(async (dbContext) => {
			const checkoutSession = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				mode: "payment",
				success_url: `${request.nextUrl.protocol}//${request.nextUrl.host}/user/wallet`,
				cancel_url: `${request.nextUrl.protocol}//${request.nextUrl.host}/not-found`,
				customer_email: account.email,
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Wallet Balance" },
							unit_amount: parsedData.data.amountInCents
						},
						quantity: 1
					}
				]
			});

			await AccountServe.insertTransaction(
				{
					accountEmail: account.email,
					amountInCents: parsedData.data.amountInCents,
					feesInCents: 0,
					taxInCents: 0,
					stripeCheckoutId: checkoutSession.id,
					paymentMethod: WalletTransactionPaymentMethod.Stripe,
					paymentStatus: WalletTransactionStatus.Pending
				},
				dbContext
			);

			return checkoutSession.url!;
		});
		return NextResponse.redirect(checkoutUrl);
	}
	// Once more paymentMethods are supported additional clauses will be added.

	return NextResponse.redirect("https://not-found");
}
