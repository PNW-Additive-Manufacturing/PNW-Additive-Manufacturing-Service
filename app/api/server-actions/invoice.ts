"use server"

import { RequestServe } from "@/app/Types/Request/RequestServe";
import { serveSession } from "@/app/utils/SessionUtils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resError, resOk, resUnauthorized } from "../APIResponse";

const payInvoiceSchema = z.object({ requestId: z.coerce.number().int() });

export async function payInvoice(data: FormData) {

	const parsedData = payInvoiceSchema.safeParse({ requestId: data.get("requestId") });

	if (!parsedData.success) return resError(`Schema Error: ${parsedData.error.message}`);

	const request = await RequestServe.fetchByIDWithAll(parsedData.data.requestId);

	if (request == undefined) return resError("Request does not exist!");

	const session = await serveSession();
	if (!session.isSignedIn || request.requesterEmail != session.account.email) return resUnauthorized();

	if (request.quote == undefined) return resError("An invoice has not been assigned to this request!");

	if (session.account.balanceInCents < request.quote.totalPriceInCents) return resError("You do not have enough balance. Visit your wallet to make a deposit.");

	try {

		await RequestServe.setAsPaid(request.id);

		revalidatePath("/");

		return resOk();
		
	} catch (error) {

		return resError(`${error}`);

	}
}
