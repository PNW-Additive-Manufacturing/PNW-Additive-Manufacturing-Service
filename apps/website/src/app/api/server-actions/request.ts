"use server";

import { z } from "zod";
import ActionResponse from "./ActionResponse";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import AccountServe from "@/app/Types/Account/AccountServe";
import { redirect } from "next/navigation";
import { isAllPending } from "@/app/Types/Part/Part";
import { isPaid } from "@/app/Types/Request/Request";

const payRequestSchema = z.object({
	requestId: z.coerce.number().int()
});
export async function cancelRequest(prevState: string, data: FormData) {
	console.log("asdsadasas");
	const parsedData = payRequestSchema.safeParse({
		requestId: data.get("requestId")
	});
	if (!parsedData.success)
		return `Schema Failed: ${parsedData.error.message}`;

	const request = await RequestServe.fetchByIDWithAll(
		parsedData.data.requestId
	);
	if (request == null) return "Request does not exist";

	// TODO: Make sure nothing has started printing AND the quote has not been paid!
	if (!isAllPending(request.parts) || isPaid(request)) {
		return "You cannot cancel at this time!";
	}

	await RequestServe.delete(request.id);
	console.log("Canceled!");
	redirect("/dashboard/user");
}
