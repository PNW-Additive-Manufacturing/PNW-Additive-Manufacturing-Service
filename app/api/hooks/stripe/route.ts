"use server";

import getConfig from "@/app/getConfig";
import AccountServe from "@/app/Types/Account/AccountServe";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { buffer } from "stream/consumers";
import Stripe from "stripe";

const envConfig = getConfig();

export async function POST(request: NextRequest) {
	const stripeSig = request.headers.get("stripe-signature") as string;
	const payloadBuffer = Buffer.from(await request.arrayBuffer());

	try {
		const stripeEvent = Stripe.webhooks.constructEvent(
			payloadBuffer,
			stripeSig,
			envConfig.stripeHookSecret
		);

		switch (stripeEvent.type) {
			case "checkout.session.completed":
				if (stripeEvent.data.object.payment_status == "paid") {
					await AccountServe.markTransactionComplete(
						stripeEvent.data.object.id
					);
					console.log("Stripe checkout completed!");
				}
				break;
		}
		console.log("Update transaction based off Stripe!");
	} catch (error) {
		console.error("Signature not verified!", error);
		return new NextResponse(null, { status: 401 });
	}

	return new NextResponse(null, { status: 200 });
}
