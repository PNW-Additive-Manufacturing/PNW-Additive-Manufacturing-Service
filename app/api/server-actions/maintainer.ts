"use server";

import db from "@/app/api/Database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import Request, {
	getTotalCost,
	hasQuote,
	isPaid
} from "@/app/Types/Request/Request";
import { SwatchConfiguration, validateColors } from "@/app/components/Swatch";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import { isRefunded, isPriced, PartStatus, isAllComplete } from "@/app/Types/Part/Part";
import PartServe from "@/app/Types/Part/PartServe";
import { PostgresError } from "postgres";
import AccountServe from "@/app/Types/Account/AccountServe";
import {
	WalletTransactionPaymentMethod,
	WalletTransactionStatus
} from "@/app/Types/Account/Wallet";
import {
	emailTemplate,
	emailTemplateDearUser,
	requestCompletedHTML,
	requestQuotedFreeHTML,
	requestQuotedHTML,
	sendEmail,
	sendRequestEmail
} from "../util/Mail";

const setPartPriceSchema = z.object({
	requestId: z.coerce.number().int(),
	priceInDollars: z.coerce.number().min(0)
});
export async function setPartPrice(
	prevState: string,
	data: FormData
): Promise<string> {
	const parsedData = setPartPriceSchema.safeParse({
		requestId: data.get("requestId"),
		priceInDollars: data.get("priceInDollars")
	});
	if (!parsedData.success) return `Schema Failed: ${parsedData.error}`;

	try {
		await db`UPDATE part SET pricecents=${parsedData.data.priceInDollars * 100
			} WHERE id=${parsedData.data.requestId}`;
	} catch (err) {
		return "An issue occurred updating the database!";
	}
	revalidatePath("/dashboard/maintainer/orders");
	return "";
}

export async function setQuote(
	prevState: string,
	data: FormData
): Promise<string> {
	const requestId = data.has("requestId")
		? Number.parseInt(data.get("requestId") as string)
		: null;
	if (requestId == null) return "Request ID not provided!";
	let request = await RequestServe.fetchByIDWithAll(requestId!);
	if (request == null) return "Request does not exist";

	const estimatedCompletionDate = data.get("estimated-completion-date")?.valueOf() as Date | undefined;
	if (estimatedCompletionDate == undefined)
	{
		return "Completion estimate required!";
	}
	
	const requester = await AccountServe.queryByEmail(request.requesterEmail);
	if (requester == undefined) return "Account no-longer exists!";

	const parts = await PartServe.fetchOfRequest(request);

	if (parts.length == 0) return "Request has zero parts";

	const priceInDollars = getTotalCost(request).totalCost;
	const priceInCents = Math.round(priceInDollars * 100);

	// if (priceInDollars > 100) return "Quote is exceeding maximum value of $100";

	try {
		await RequestServe.setQuote(requestId, priceInCents, estimatedCompletionDate);
		console.log("Updated quote! for ", requestId, priceInCents);
	} catch (error) {
		return "An exception occurred updating database.";
	}

	// If the total-cost is zero, we are going to automatically assume it was "paid for"!
	if (priceInCents == 0) await RequestServe.setAsPaid(request.id);

	// Lazy method of updating fields of quote property on Request.
	request = (await RequestServe.fetchByIDWithAll(requestId))!;

	try {
		if (priceInCents == 0)
		{
			sendRequestEmail("approved", request);
			// await sendEmail(request.requesterEmail, `Request approved for ${request.name}`, await requestQuotedFreeHTML(request));
		}
		else
		{
			sendRequestEmail("quoted", request);
			// await sendEmail(request.requesterEmail, `Request quoted for ${request.name}`, await requestQuotedHTML(request));
		}
	} catch (error) 
	{
		console.error("Failed to send Email!", error);
	}

	revalidatePath("/dashboard/maintainer/orders/");
	return "";
}

export async function getOrders(): Promise<Request[]> {
	return await RequestServe.fetchAll();
}

export async function setPartPrinter(
	prevState: string,
	data: FormData
): Promise<string> {
	var partId = data.get("part_id") as string;
	var printerName = data.get("printer_name") as string;

	let result = await db`update part set AssignedPrinterName=${printerName == "unassigned" ? null : printerName
		} where id=${partId} returning id`;

	if (result.count == 0) return "No part found";

	return "";
}

const revokePartSchema = z.object({
	partId: z.coerce.number().int(),
	reasonForRevoke: z.string(),
	dfm: z.array(z.string())
});
export async function revokePart(
	prevState: string,
	data: FormData
): Promise<string | undefined> {
	const parsedData = revokePartSchema.safeParse({
		partId: data.get("partId"),
		reasonForRevoke: data.get("reasonForRevoke"),
		dfm: data.getAll("dfm")
	});
	if (!parsedData.success) return `Schema Failed: ${parsedData.error}`;

	console.log(parsedData.data.dfm);

	const message = parsedData.data.reasonForRevoke;
	// const message = `${parsedData.data!.dfm.map((value) => `- ${value}\n`)}${
	// 	parsedData.data!.reasonForRevoke
	// }`;

	try {
		await db`UPDATE Part SET Status=${PartStatus.Denied
			}, PriceCents=null, RevokedReason=${message} WHERE Id=${parsedData.data!.partId
			}`;
	} catch (error) {
		console.log(error);
		return "An error occurred revoking part!";
	}
	revalidatePath("/dashboard/maintainer/orders");
	return;
}

const modifyPartSchema = z.object({
	partId: z.coerce.number().int(),
	status: z.nativeEnum(PartStatus).optional().nullable(),
	costInDollars: z.coerce.number().optional().nullable(),
	reasonForRefund: z.string().optional().nullable(),
	refundQuantity: z.coerce.number().int().optional().nullable(),
	supplementedMaterial: z.string().optional().nullable(),
	supplementedColor: z.string().optional().nullable()
});
export async function modifyPart(
	prevState: string,
	data: FormData
): Promise<string | undefined> {
	const parsedData = modifyPartSchema.safeParse({
		partId: data.get("partId"),
		status: data.get("status"),
		costInDollars: data.get("costInDollars"),
		reasonForRefund: data.get("reasonForRefund"),
		refundQuantity: data.get("refundQuantity"),
		supplementedMaterial: data.get("material"),
		supplementedColor: data.get("color")
	});

	if (!parsedData.success) return `Schema Failed: ${parsedData.error}`;

	const previousPart = await PartServe.queryById(parsedData.data.partId);
	if (previousPart == undefined) return "Part does not exist!";

	const partRequest = await RequestServe.fetchByIDWithAll(
		previousPart.requestId
	);
	if (partRequest == undefined) return "Request does not exist!";

	// https://zod.dev/?id=discriminated-unions

	const newValues: Record<string, any> = {};

	const includesSupplementFilament =
		parsedData.data!.supplementedColor != undefined &&
		parsedData.data!.supplementedMaterial != undefined;
	if (includesSupplementFilament) {
		const filament = await FilamentServe.queryIdByNameAndMaterial(
			parsedData.data!.supplementedColor!,
			parsedData.data!.supplementedMaterial!
		);
		if (filament == undefined)
			return "Supplemented filament does not exist!";

		newValues["SupplementedFilamentId".toLowerCase()] = filament?.id;
	}

	const includesStatus =
		parsedData.data!.status != undefined &&
		previousPart.status != parsedData.data!.status;

	if (includesStatus) 
	{
		newValues["status"] = parsedData.data!.status!;
		partRequest.parts.find(p => parsedData.data.partId)!.status = parsedData.data!.status!;
	}

	const includesCost = parsedData.data!.costInDollars != undefined;
	if (includesCost)
		newValues["pricecents"] = parsedData.data.costInDollars! * 100;

	const includesRefund =
		parsedData.data.reasonForRefund != undefined &&
		parsedData.data.refundQuantity != undefined;

	return db.begin(async (dbContext) => {
		if (
			parsedData.data!.status != PartStatus.Denied &&
			previousPart.status == PartStatus.Denied
		) {
			// Part is no longer denied.
			newValues["revokedreason"] = undefined;
		}

		if (includesRefund) {
			if (isRefunded(previousPart)) {
				return "Schema Error: Part cannot be modified once refunded!";
			} else if (!isPaid(partRequest)) {
				return "Schema Error: Part cannot be refunded without request being paid!";
			}

			const refundTotalInDollars =
				(parsedData.data!.costInDollars ??
					previousPart.priceInDollars!) *
				parsedData.data.refundQuantity!;

			console.log(`Refunding ${refundTotalInDollars.toFixed(2)}`);

			// Insert a new transaction
			let transactionId = await AccountServe.insertTransaction(
				{
					accountEmail: previousPart.model.ownerEmail!,
					amountInCents: Math.round(refundTotalInDollars * 100),
					feesInCents: 0,
					taxInCents: 0,
					paymentMethod: WalletTransactionPaymentMethod.Refund,
					paymentStatus: WalletTransactionStatus.Paid
				},
				dbContext
			);

			newValues["refundreason"] = parsedData.data!.reasonForRefund!;
			newValues["refundquantity"] = parsedData.data!.refundQuantity!;
			newValues["refundwallettransactionid"] = transactionId!;
		}

		console.log(
			`Modifying Part with ID ${parsedData.data.partId}`,
			newValues
		);

		const hasValuesToUpdate = Object.keys(newValues).length != 0;
		if (!hasValuesToUpdate) return;

		try {
			await dbContext`UPDATE Part SET ${db(
				newValues,
				Object.keys(newValues)
			)} WHERE Id=${parsedData.data.partId}`;
		} catch (error) {
			console.error(`Failed to modify Part!`, error as Error);
			return "An internal error occurred modifying the part!";
		}

		if (isAllComplete(partRequest.parts))
		{
			sendRequestEmail("completed", partRequest);	
		}

		revalidatePath("/dashboard/maintainer/orders");
	});
}

const sendEmailSchema = z.object({
	to: z.string().email(),
	subject: z.string(),
	plaintext: z.string()
});
// export async function sendTestEmail(prevState: string, data: FormData) {
// 	console.log(prevState, data);
// 	const parsedData = sendEmailSchema.safeParse({
// 		to: data.get("to"),
// 		subject: data.get("subject"),
// 		plaintext: data.get("plaintext")
// 	});
// 	if (!parsedData.success) return `Schema Failed: ${parsedData.error!}`;

// 	const formattedHTML = await emailTemplate(
// 		`<p style="font-family: inherit; color: rgb(64, 64, 64);">
// 			${parsedData.data.plaintext}
// 		</p>`
// 	);

// 	try {
// 		await sendEmail(
// 			parsedData.data.to,
// 			parsedData.data.subject,
// 			formattedHTML
// 		);
// 		return "";
// 	} catch (error) {
// 		return `${error}`;
// 	}
// }

// export async function 

export async function setRequestFulfilled(
	requestId: string,
	isfulfilled: boolean
): Promise<string> {
	var [request] =
		await db`update request set isfulfilled=${isfulfilled} where id=${requestId} returning id`;
	if (request.count == 0) return "No request found";

	revalidatePath("/dashboard/maintainer");
	return "";
}

export async function addFilament(
	prevState: string,
	data: FormData
): Promise<{
	error: string | null;
	newMaterial: string | null;
	newColor: SwatchConfiguration | null;
	instock: boolean | null;
}> {
	const material = data.get("filament-material") as string;
	const materialCostInCents = Math.round(
		Number.parseFloat(data.get("filament-material-cost")!.toString()) * 100
	);
	const details = data.get("filament-details") as string;
	const colorName = data.get("filament-colorName") as string;
	const monoColor = data.get("filament-mono-color") as string;
	const diColorA = data.get("filament-di-colorA") as string;
	const diColorB = data.get("filament-di-colorB") as string;
	const leadTimeInDays = Number.parseInt(data.get("filament-lead-time-in-days") as string);
	const technology = data.get("filament-technology") as string;

	const newSwatch: SwatchConfiguration = {
		name: colorName,
		monoColor,
		diColor: {
			colorA: diColorA,
			colorB: diColorB
		}
	};
	validateColors(newSwatch);

	await FilamentServe.insert({
		material,
		color: newSwatch,
		inStock: true,
		costPerGramInCents: materialCostInCents,
		details,
		leadTimeInDays: 1,
		technology: "FDM"
	});

	//successful
	revalidatePath("/dashboard/maintainer/filaments");
	return {
		error: null,
		newMaterial: material,
		newColor: newSwatch,
		instock: true
	};
}

export async function setFilamentInStock(
	prevState: string,
	data: FormData
): Promise<string> {
	var material = (data.get("filament-material") as string).toLowerCase();
	var color = (data.get("filament-color") as string).toLowerCase();
	var inStock = (data.get("filament-instock") as string) === "true";

	try {
		await FilamentServe.setInStock(material, color, inStock);
	} catch (e: any) {
		return "Failed to update filament with error: " + e.message;
	}

	return "";
}

export async function deleteFilament(prevState: string, data: FormData) {
	var material = (data.get("filament-material") as string).toLowerCase();
	var color = (data.get("filament-color") as string).toLowerCase();

	await FilamentServe.delete(material, color);
}
