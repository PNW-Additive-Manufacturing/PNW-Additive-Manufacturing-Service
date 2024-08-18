"use server";

import { z } from "zod";
import ActionResponse, { ActionResponsePayload } from "./ActionResponse";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { getJwtPayload } from "../util/JwtHelper";
import AccountServe from "@/app/Types/Account/AccountServe";
import db from "@/app/api/Database";
import { revalidatePath } from "next/cache";

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

	const JWTPayload = (await getJwtPayload())!;
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
