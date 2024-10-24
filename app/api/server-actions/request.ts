"use server";

import { z } from "zod";
import ActionResponse from "./ActionResponse";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import AccountServe from "@/app/Types/Account/AccountServe";
import { redirect } from "next/navigation";
import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import { isPaid } from "@/app/Types/Request/Request";
import { getJwtPayload } from "../util/JwtHelper";
import { AccountPermission } from "@/app/Types/Account/Account";
import { revalidatePath } from "next/cache";

const payRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function cancelRequest(prevState: string, data: FormData) {
	const parsedData = payRequestSchema.safeParse({
		requestId: data.get("requestId")
	});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	const jwtPayload = await getJwtPayload();
	if (
		jwtPayload.email != request.requesterEmail &&
		jwtPayload.permission == AccountPermission.User
	) {
		return "You do not have access to this resource!";
	}

	// TODO: Make sure nothing has started printing AND the quote has not been paid!
	if (!isAllPending(request.parts) || isPaid(request)) {
		return "You cannot cancel at this time!";
	}

	await RequestServe.delete(request.id);
	console.log("Canceled!");
	redirect("/dashboard/user");
}

const fulfillRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function fulfillRequest(
	prevState: string,
	data: FormData
): Promise<string> {
	const parsedData = fulfillRequestSchema.safeParse({
		requestId: data.get("requestId")
	});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	const jwtPayload = await getJwtPayload();
	if (jwtPayload.permission == AccountPermission.User) {
		return "You do not have access to this resource!";
	}

	// TODO: Make sure nothing has started printing AND the quote has not been paid!
	if (!isAllComplete(request.parts)) {
		return "Request cannot be fulfilled until all parts are complete!";
	}

	await RequestServe.setAsFulfilled(request.id);
	revalidatePath("/");
	return "";
}

const deleteRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function deleteRequest(prevState: string, data: FormData): Promise<string> {
	const parsedData = deleteRequestSchema.safeParse({requestId: data.get("requestId")});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	const jwtPayload = await getJwtPayload();
	if (jwtPayload.permission == AccountPermission.User) return "You do not have access to this resource!";

	if (isPaid(request)) return "Request cannot be deleted if Quote has been Paid!";

	await RequestServe.delete(request.id);
	redirect("/dashboard/maintainer/orders/");
}