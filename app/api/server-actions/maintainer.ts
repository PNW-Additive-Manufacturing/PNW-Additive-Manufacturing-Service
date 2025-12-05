"use server";

import db from "@/app/api/Database";
import { SwatchConfiguration, validateColors } from "@/app/components/Swatch";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import { isAllComplete, isRefunded, PartStatus } from "@/app/Types/Part/Part";
import PartServe from "@/app/Types/Part/PartServe";
import { ProjectSpotlight } from "@/app/Types/ProjectSpotlight/ProjectSpotlight";
import ProjectSpotlightServe from "@/app/Types/ProjectSpotlight/ProjectSpotlightServe";
import Request, {
	calculateTotalCost,
	isPaid
} from "@/app/Types/Request/Request";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { dollarsToCents } from "@/app/utils/MathUtils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { APIData, resError, resOk, resOkData, resUnauthorized } from "../APIResponse";
import { retrieveSafeJWTPayload } from "../util/JwtHelper";
import {
	formatPartFlagged,
	formatPartUnFlagged,
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
		await db`UPDATE part SET pricecents=${dollarsToCents(parsedData.data.priceInDollars)} WHERE id=${parsedData.data.requestId}`;
	} catch (err) {
		return "An issue occurred updating the database!";
	}
	revalidatePath("/dashboard/maintainer/orders");
	return "";
}

export async function setQuote(prevState: undefined, data: FormData): Promise<APIData<{}>> {
	const requestId = data.has("requestId")
		? Number.parseInt(data.get("requestId") as string)
		: null;
	if (requestId == null) return resError("Request ID not provided!");
	let request = await RequestServe.fetchByIDWithAll(requestId!);
	if (request == null) return resError("Request does not exist");

	const estimatedCompletionDate = data.get("estimated-completion-date")?.valueOf() as Date | undefined;
	if (estimatedCompletionDate == undefined) {
		return resError("Completion estimate required!");
	}

	const requester = await AccountServe.queryByEmail(request.requesterEmail);
	if (requester == undefined) return resError("Account no-longer exists!");

	const parts = await PartServe.fetchOfRequest(request);

	if (parts.length == 0) return resError("Request has zero parts");


	const costs = calculateTotalCost(request, Number.parseFloat(data.get("cost_fees") as string));
	const priceInCents = dollarsToCents(costs.totalCost);

	console.log(costs);

	// if (priceInDollars > 100) return "Quote is exceeding maximum value of $100";

	try {
		await RequestServe.setQuote(requestId, costs, estimatedCompletionDate);
		console.log("Updated quote! for ", requestId, priceInCents);
	} catch (error) {
		console.error(error);
		return resError("An exception occurred updating database.");
	}

	// If the total-cost is zero, we are going to automatically assume it was "paid for"!
	if (priceInCents == 0) await RequestServe.setAsPaid(request.id);

	// Lazy method of updating fields of quote property on Request.
	request = (await RequestServe.fetchByIDWithAll(requestId))!;

	try {
		if (priceInCents == 0) {
			sendRequestEmail("approved", request);
			// await sendEmail(request.requesterEmail, `Request approved for ${request.name}`, await requestQuotedFreeHTML(request));
		}
		else {
			sendRequestEmail("quoted", request);
			// await sendEmail(request.requesterEmail, `Request quoted for ${request.name}`, await requestQuotedHTML(request));
		}
	} catch (error) {
		console.error("Failed to send Email!", error);
	}

	revalidatePath("/dashboard/maintainer/orders/");
	return resOk();
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
	reasonForRevoke: z.string().nullable()
});
export async function revokePart(data: FormData): Promise<APIData<{ emailSent: boolean }>> {
	const parsedData = revokePartSchema.safeParse({
		partId: data.get("partId"),
		reasonForRevoke: data.get("reasonForRevoke")
	});
	if (!parsedData.success) return resError(`Schema Failed: ${parsedData.error}`);

	const queriedPart = await PartServe.queryById(parsedData.data.partId);

	if (queriedPart == null) return resError("Requested part does not exist!");

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const partOwnerEmail = (await RequestServe.queryOwnerEmail(queriedPart.requestId))!;
	console.log(partOwnerEmail);

	if (queriedPart.deniedReason !== null && parsedData.data.reasonForRevoke !== null) return resError("Request part has already been denied!");

	try {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		await db`UPDATE Part SET Status=${parsedData.data.reasonForRevoke == null ? PartStatus.Pending : PartStatus.Denied}, RevokedReason=${parsedData.data.reasonForRevoke}, PriceCents=NULL WHERE Id=${parsedData.data!.partId}`;
	}
	catch (error) {
		console.log(error);
		return resError("Please try again later!");
	}

	const isUnflagged = parsedData.data.reasonForRevoke == null;
	const subject = isUnflagged ? "Model Issues Resolved" : "Model Issues Flagged";
	const body = isUnflagged
		? await formatPartUnFlagged(queriedPart.requestId)
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		: await formatPartFlagged(queriedPart.requestId, parsedData.data.reasonForRevoke!);

	let emailSent = false;

	try {
		await sendEmail(partOwnerEmail, subject, body);
		emailSent = true;
	} catch (ex) {
		console.error(ex);
	}

	revalidatePath("/dashboard/maintainer/orders");
	return resOkData({ emailSent });
}

const modifyPartSchema = z.object({
	partId: z.coerce.number().int(),
	status: z.nativeEnum(PartStatus).optional().nullable(),
	costInDollars: z.coerce.number().optional().nullable(),
	reasonForRefund: z.string().optional().nullable(),
	refundQuantity: z.coerce.number().int().optional().nullable(),
	supplementedMaterial: z.string().optional().nullable(),
	supplementedColor: z.string().optional().nullable(),
	supplementReason: z.string().optional().nullable()
});
export async function modifyPart(data: FormData): Promise<APIData<{}>> {
	console.log(data);
	const parsedData = modifyPartSchema.safeParse({
		partId: data.get("partId"),
		status: data.get("status"),
		costInDollars: data.get("costInDollars"),
		reasonForRefund: data.get("reasonForRefund"),
		refundQuantity: data.get("refundQuantity"),
		supplementedMaterial: data.get("material"),
		supplementedColor: data.get("color"),
		supplementReason: data.get("supplement-reason")
	});

	if (!parsedData.success) return resError(`Schema Failed: ${parsedData.error}`);

	const previousPart = await PartServe.queryById(parsedData.data.partId);
	if (previousPart == undefined) return resError("Part does not exist!");

	const partRequest = await RequestServe.fetchByIDWithAll(
		previousPart.requestId
	);
	if (partRequest == undefined) return resError("Request does not exist!");

	// https://zod.dev/?id=discriminated-unions

	const newValues: Record<string, any> = {};

	if (parsedData.data!.supplementedColor != undefined && parsedData.data!.supplementedMaterial != undefined) {
		const filament = await FilamentServe.queryIdByNameAndMaterial(
			parsedData.data!.supplementedColor!,
			parsedData.data!.supplementedMaterial!
		);
		if (filament == undefined)
			return resError("Supplemented filament does not exist!");

		if (parsedData.data.supplementReason != null) {
			newValues["SupplementedReason".toLowerCase()] = parsedData.data.supplementReason;
		}
		newValues["SupplementedFilamentId".toLowerCase()] = filament?.id;
	}

	const includesStatus =
		parsedData.data!.status != undefined &&
		previousPart.status != parsedData.data!.status;

	if (includesStatus) {
		newValues["status"] = parsedData.data!.status!;
		partRequest.parts.find(p => parsedData.data.partId)!.status = parsedData.data!.status!;
	}

	const includesCost = parsedData.data!.costInDollars != undefined;
	if (includesCost && parsedData.data.costInDollars) newValues["pricecents"] = dollarsToCents(parsedData.data.costInDollars)

	const includesRefund =
		parsedData.data.reasonForRefund != undefined &&
		parsedData.data.refundQuantity != undefined;

	return db.begin(async (dbContext) => {
		if (includesRefund) {
			if (isRefunded(previousPart)) {
				return resError("Schema Error: Part cannot be modified once refunded!");
			}
			if (!isPaid(partRequest)) {
				return resError("Schema Error: Part cannot be refunded without request being paid!");
			}

			const refundTotalInDollars =
				(parsedData.data!.costInDollars ??
					previousPart.priceInDollars!) *
				parsedData.data.refundQuantity!;

			console.log(`Refunding ${refundTotalInDollars.toFixed(2)}`);

			newValues.refundreason = parsedData.data!.reasonForRefund!;
			newValues.refundquantity = parsedData.data!.refundQuantity!;
		}

		console.log(
			`Modifying Part with ID ${parsedData.data.partId}`,
			newValues
		);

		const hasValuesToUpdate = Object.keys(newValues).length != 0;
		if (!hasValuesToUpdate) return resOk();

		try {
			await dbContext`UPDATE Part SET ${db(
				newValues,
				Object.keys(newValues)
			)} WHERE Id=${parsedData.data.partId}`;
		} catch (error) {
			console.error("Failed to modify Part!", error as Error);
			return resError("An internal error occurred modifying the part!");
		}

		if (isAllComplete(partRequest.parts)) {
			sendRequestEmail("completed", partRequest);
		}

		revalidatePath("/dashboard/maintainer/orders");

		return resOk();
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
	const materialCostInCents = dollarsToCents(Number.parseFloat(data.get("filament-material-cost")!.toString()));
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
		leadTimeInDays: leadTimeInDays,
		technology: technology
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

const postProjectShowcaseSchema = z.object({
	title: z.string(),
	description: z.string(),
	author: z.string(),
});
export async function postProjectShowcase(prevState: APIData<{}>, data: FormData) {
	const jwtPayload = await retrieveSafeJWTPayload();
	if (jwtPayload == undefined || jwtPayload.permission == "user") return resUnauthorized();

	const parsedData = postProjectShowcaseSchema.safeParse({
		title: data.get("title"),
		description: data.get("description"),
		author: data.get("author")
	});
	if (!parsedData.success) return resError(parsedData.error.message);

	const image = data.get("image") as File;

	try {
		await ProjectSpotlightServe.insertProjectShowcase(parsedData.data, image);
	}
	catch (ex) {
		return resError((ex as Error).message);
	}
	revalidatePath("/project-spotlight");
	return resOk();
}

export async function deleteProjectShowcase(prevState: APIData<{}>, data: FormData) {
	const jwtPayload = await retrieveSafeJWTPayload();
	if (jwtPayload == undefined || jwtPayload.permission == "user") return resUnauthorized();

	const parsedData = z.string().safeParse(data.get("projectId"));

	if (!parsedData.success) return resError(parsedData.error.message);

	try {
		await ProjectSpotlightServe.deleteProjectShowcase(parsedData.data);
	}
	catch (ex) {
		console.error(ex);
		return resError((ex as Error).message);
	}
	revalidatePath("/project-spotlight");
	return resOk();
}

const editProjectShowcaseSchema = postProjectShowcaseSchema.partial().and(z.object({ id: z.string() }));
export async function editProjectShowcase(prevState: APIData<{}>, data: FormData) {
	const jwtPayload = await retrieveSafeJWTPayload();
	if (jwtPayload == undefined || jwtPayload.permission == "user") return resUnauthorized();

	console.log(data);

	const parsedData = editProjectShowcaseSchema.safeParse({
		title: data.get("title"),
		description: data.get("description"),
		author: data.get("author"),
		id: data.get("projectId")
	});
	if (!parsedData.success) return resError(parsedData.error.message);

	let dataToUpdated: Omit<Partial<ProjectSpotlight>, "id" | "hasImage"> & { id: ProjectSpotlight["id"] } = {
		id: parsedData.data!.id
	};

	if (parsedData.data?.author != undefined) dataToUpdated.author = parsedData.data.author;
	if (parsedData.data?.description != undefined) dataToUpdated.description = parsedData.data.description;
	if (parsedData.data?.title != undefined) dataToUpdated.title = parsedData.data.title;

	try {
		await ProjectSpotlightServe.editProjectShowcase(dataToUpdated);
	}
	catch (ex) {
		console.error(ex);
		return resError((ex as Error).message);
	}
	revalidatePath("/project-spotlight");
	return resOk();
}
