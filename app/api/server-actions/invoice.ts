"use server";

import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import db from "@/app/api/Database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serveOptionalSession, serveRequiredSession } from "../util/SessionHelper";
import ActionResponse, { ActionResponsePayload } from "./ActionResponse";

const payInvoiceSchema = z.object({ requestId: z.coerce.number().int() });
export async function payInvoice(
	prevState: ActionResponsePayload<undefined>,
	data: FormData
): Promise<ActionResponsePayload<undefined>> {
	const parsedData = payInvoiceSchema.safeParse({
		requestId: data.get("requestId")
	});

	if (!parsedData.success)
		return ActionResponse.Error<undefined>(
			`Schema Error: ${parsedData.error.message}`
		);

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == undefined) {
		return ActionResponse.Error("Request does not exist!");
	}

	let JWTPayload;
	try {
		JWTPayload = await serveRequiredSession();
	} catch (error) {
		return ActionResponse.Error("Authentication required");
	}

	if (request.requesterEmail != JWTPayload.email) {
		return ActionResponse.ErrorLackPermission();
	}

	const account = await AccountServe.queryByEmail(JWTPayload.email);
	if (request.quote == undefined) {
		return ActionResponse.Error(
			"An invoice has not been assigned to this request!"
		);
	}

	if (account!.balanceInDollars < request.quote.totalPriceInCents / 100) {
		return ActionResponse.Error("You do not have the required balance!");
	}

	console.log(
		`Paying for request #${request.id} for \$${
			request.quote!.totalPriceInCents
		}!`
	);

	try {
		await db.begin(async (dbTransaction) => {
			await RequestServe.setAsPaid(request.id, dbTransaction);
		});

		revalidatePath("/");

		return ActionResponse.Ok(undefined);
	} catch (error) {
		console.log(error);
		return ActionResponse.Error("Something went wrong!");
	}
}

const forceAcceptInvoiceSchema = z.object({ requestId: z.coerce.number().int() });
export async function forceAcceptInvoice(
	data: FormData
): Promise<ActionResponsePayload<undefined>> {
	const jwtPayload = await serveOptionalSession();
	if (jwtPayload == null || jwtPayload.permission == AccountPermission.User) {
		return ActionResponse.ErrorLackPermission();
	}

	const parsedData = forceAcceptInvoiceSchema.safeParse({
		requestId: data.get("requestId")
	});

	if (!parsedData.success)
		return ActionResponse.Error<undefined>(
			`Schema Error: ${parsedData.error.message}`
		);

	const request = await RequestServe.fetchByIDWithAll(parsedData.data.requestId);
	if (request == undefined) {
		return ActionResponse.Error("Request does not exist!");
	}

	if (request.quote == undefined) {
		return ActionResponse.Error(
			"An invoice has not been assigned to this request!"
		);
	}

	if (request.quote.isPaid) {
		return ActionResponse.Error("This request has already been paid.");
	}

	console.log(
		`Maintainer ${jwtPayload.email} force-accepting request #${request.id} for $${
			request.quote.totalPriceInCents / 100
		}.`
	);

	try {
		await db.begin(async (dbTransaction) => {
			await RequestServe.setAsPaid(request.id, dbTransaction);
		});

		revalidatePath("/");

		return ActionResponse.Ok(undefined);
	} catch (error) {
		console.log(error);
		return ActionResponse.Error("Something went wrong!");
	}
}
