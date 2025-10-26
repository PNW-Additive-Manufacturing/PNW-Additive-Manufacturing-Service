"use server";

import { AccountPermission } from "@/app/Types/Account/Account";
import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import { isPaid } from "@/app/Types/Request/Request";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { serveSession } from "@/app/utils/SessionUtils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

	const session = await serveSession();
	if (!session.isSignedIn || (session.account.permission == AccountPermission.User && session.account.email.toLowerCase() != request.requesterEmail.toLowerCase())) 
		return "You do not have access to this resource!";

	if (!isAllPending(request.parts) || isPaid(request)) {
		return "You cannot cancel at this time!";
	}

	await RequestServe.delete(request.id);
	redirect("/dashboard/user");
}

const fulfillRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function fulfillRequest(
	prevState: string,
	data: FormData
): Promise<string> {

	const session = await serveSession();
	if (!session.isSignedIn || session.account.permission == AccountPermission.User) return "You do not have access to this resource!";
	
	const parsedData = fulfillRequestSchema.safeParse({
		requestId: data.get("requestId")
	});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	// TODO: Make sure nothing has started printing AND the quote has not been paid!
	// Correction: What if we have already printed them out for free or been paid another way outside of the website?
	// - We still want to track the order as it was last configured.
	if (!isAllComplete(request.parts)) 
	{
		// Update database and mark all as completed.
		await RequestServe.setPartsAsPrinted(request.id);
	}

	await RequestServe.setAsFulfilled(request.id);
	revalidatePath("/");
	return "";
}

const deleteRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function deleteRequest(prevState: string, data: FormData): Promise<string> {

	const session = await serveSession();
	if (!session.isSignedIn || session.account.permission == AccountPermission.User) return "You do not have access to this resource!";

	const parsedData = deleteRequestSchema.safeParse({requestId: data.get("requestId")});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	if (isPaid(request)) return "Request cannot be deleted if Quote has been Paid!";

	await RequestServe.delete(request.id);
	redirect("/dashboard/maintainer/orders/");
}