"use server";

import db from "@/app/api/Database";
import { SwatchConfigurationSchema } from "@/app/components/Swatch";
import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import ManufacturingMethodServe from "@/app/Types/ManufacturingMethod/ManufacturingMethodServe";
import MaterialServe from "@/app/Types/Material/MaterialServe";
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
import {
    formatPartFlagged,
    formatPartUnFlagged,
    sendEmail,
    sendRequestEmail
} from "../util/Mail";
import { serveOptionalSession } from "../util/SessionHelper";

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

	revalidatePath("/dashboard/maintainer/orders/[orderId]", "page");
	revalidatePath("/dashboard/user/[id]", "page");
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
		const filament = await FilamentServe.queryByColorAndMaterial(
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
		partRequest.parts.find(p => p.id === parsedData.data.partId)!.status = parsedData.data!.status!;
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
): Promise<{ error: string | null }> {
	const materialShortName = data.get("filament-material") as string;
	const methodShortName = data.get("filament-method") as string;
	const colorName = data.get("filament-colorName") as string;
	const monoColor = (data.get("filament-mono-color") as string) || undefined;
	const diColorA = (data.get("filament-di-colorA") as string) || undefined;
	const diColorB = (data.get("filament-di-colorB") as string) || undefined;
	const costRaw = (data.get("filament-material-cost") as string)?.trim();
	const costInDollars = costRaw ? Number.parseFloat(costRaw) : 0;
	const leadTimeInDays = Number.parseInt(data.get("filament-lead-time-in-days") as string);
	const description = (data.get("filament-details") as string) ?? "";

	if (!materialShortName || !methodShortName || !colorName)
		return { error: "Material, method, and color name are required." };
	if (Number.isNaN(costInDollars) || Number.isNaN(leadTimeInDays))
		return { error: "Invalid cost or lead time." };

	const colorParsed = SwatchConfigurationSchema.safeParse({
		name: colorName,
		monoColor,
		diColor: diColorA && diColorB ? { colorA: diColorA, colorB: diColorB } : undefined,
	});
	if (!colorParsed.success)
		return { error: "Invalid color configuration." };

	try {
		await FilamentServe.insert({
			material: { shortName: materialShortName } as any,
			manufacturingMethod: { shortName: methodShortName } as any,
			color: colorParsed.data,
			inStock: true,
			isArchived: false,
			costPerGramInCents: dollarsToCents(costInDollars),
			description,
			leadTimeInDays,
			benefits: [],
			cons: [],
			icon: null,
		});
	} catch (e: any) {
		return { error: e.message };
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return { error: null };
}

export async function addManufacturingMethod(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = (data.get("shortName") as string)?.trim();
	const wholeName = (data.get("wholeName") as string)?.trim();
	const description = (data.get("description") as string) ?? "";
	const icon = (data.get("icon") as string) || null;
	const benefits = ((data.get("benefits") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const cons = ((data.get("cons") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const learnMoreURL = (data.get("learnMoreURL") as string) || undefined;
	const company = (data.get("company") as string) || undefined;
	const unit = (data.get("unit") as string) || "g";

	if (!shortName || !wholeName) return "Short name and whole name are required.";

	try {
		await ManufacturingMethodServe.insert({
			shortName, wholeName, description, icon, benefits, cons, learnMoreURL, company, unit,
		} as any);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function deleteManufacturingMethod(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = data.get("shortName") as string;
	if (!shortName) return "Short name is required.";

	try {
		await ManufacturingMethodServe.delete(shortName);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function addMaterial(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = (data.get("shortName") as string)?.trim();
	const wholeName = (data.get("wholeName") as string)?.trim();
	const description = (data.get("description") as string) ?? "";
	const icon = (data.get("icon") as string) || null;
	const benefits = ((data.get("benefits") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const cons = ((data.get("cons") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const learnMoreURL = (data.get("learnMoreURL") as string) || undefined;

	if (!shortName || !wholeName) return "Short name and whole name are required.";

	try {
		await MaterialServe.insert({
			shortName, wholeName, description, icon, benefits, cons, learnMoreURL,
		} as any);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function deleteMaterial(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = data.get("shortName") as string;
	if (!shortName) return "Short name is required.";

	try {
		await MaterialServe.delete(shortName);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function setFilamentInStock(
	prevState: string,
	data: FormData
): Promise<string> {
	const filamentId = Number.parseInt(data.get("filament-id") as string);
	const inStock = (data.get("filament-instock") as string) === "true";

	if (Number.isNaN(filamentId)) return "Invalid filament ID.";

	try {
		await FilamentServe.setInStock(filamentId, inStock);
	} catch (e: any) {
		return "Failed to update filament with error: " + e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function deleteFilament(
	prevState: string,
	data: FormData
): Promise<string> {
	const filamentId = Number.parseInt(data.get("filament-id") as string);
	if (Number.isNaN(filamentId)) return "Invalid filament ID.";

	try {
		await FilamentServe.delete(filamentId);
	} catch (e: any) {
		return e?.message ?? "Failed to delete filament.";
	}
	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function setFilamentArchived(
	prevState: string,
	data: FormData
): Promise<string> {
	const filamentId = Number.parseInt(data.get("filament-id") as string);
	const isArchived = (data.get("filament-archived") as string) === "true";

	if (Number.isNaN(filamentId)) return "Invalid filament ID.";

	try {
		await FilamentServe.setArchived(filamentId, isArchived);
	} catch (e: any) {
		return "Failed to update filament with error: " + e.message;
	}
	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function editManufacturingMethod(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = (data.get("shortName") as string)?.trim();
	const wholeName = (data.get("wholeName") as string)?.trim();
	const description = (data.get("description") as string) ?? "";
	const icon = (data.get("icon") as string) || null;
	const benefits = ((data.get("benefits") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const cons = ((data.get("cons") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const learnMoreURL = (data.get("learnMoreURL") as string) || undefined;
	const company = (data.get("company") as string) || undefined;
	const unit = (data.get("unit") as string) || "g";

	if (!shortName || !wholeName) return "Short name and whole name are required.";

	try {
		await ManufacturingMethodServe.update({
			shortName, wholeName, description, icon, benefits, cons, learnMoreURL, company, unit,
		} as any);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function editMaterial(
	prevState: string,
	data: FormData
): Promise<string> {
	const shortName = (data.get("shortName") as string)?.trim();
	const wholeName = (data.get("wholeName") as string)?.trim();
	const description = (data.get("description") as string) ?? "";
	const icon = (data.get("icon") as string) || null;
	const benefits = ((data.get("benefits") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const cons = ((data.get("cons") as string) ?? "").split(",").map(s => s.trim()).filter(Boolean);
	const learnMoreURL = (data.get("learnMoreURL") as string) || undefined;

	if (!shortName || !wholeName) return "Short name and whole name are required.";

	try {
		await MaterialServe.update({
			shortName, wholeName, description, icon, benefits, cons, learnMoreURL,
		} as any);
	} catch (e: any) {
		return e.message;
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return "";
}

export async function editFilament(
	prevState: string,
	data: FormData
): Promise<{ error: string | null }> {
	const filamentId = Number.parseInt(data.get("filament-id") as string);
	const colorName = data.get("filament-colorName") as string;
	const monoColor = (data.get("filament-mono-color") as string) || undefined;
	const diColorA = (data.get("filament-di-colorA") as string) || undefined;
	const diColorB = (data.get("filament-di-colorB") as string) || undefined;
	const costRaw = (data.get("filament-material-cost") as string)?.trim();
	const costInDollars = costRaw ? Number.parseFloat(costRaw) : 0;
	const leadTimeInDays = Number.parseInt(data.get("filament-lead-time-in-days") as string);
	const description = (data.get("filament-details") as string) ?? "";

	if (Number.isNaN(filamentId)) return { error: "Invalid filament ID." };
	if (!colorName) return { error: "Color name is required." };
	if (Number.isNaN(costInDollars) || Number.isNaN(leadTimeInDays))
		return { error: "Invalid cost or lead time." };

	const colorParsed = SwatchConfigurationSchema.safeParse({
		name: colorName,
		monoColor,
		diColor: diColorA && diColorB ? { colorA: diColorA, colorB: diColorB } : undefined,
	});
	if (!colorParsed.success)
		return { error: "Invalid color configuration." };

	try {
		await FilamentServe.update({
			id: filamentId,
			color: colorParsed.data,
			costPerGramInCents: dollarsToCents(costInDollars),
			leadTimeInDays,
			description,
		});
	} catch (e: any) {
		return { error: e.message };
	}

	revalidatePath("/dashboard/maintainer/filaments");
	return { error: null };
}

const postProjectShowcaseSchema = z.object({
	title: z.string(),
	description: z.string(),
	author: z.string(),
});
export async function postProjectShowcase(prevState: APIData<{}>, data: FormData) {
	const jwtPayload = await serveOptionalSession();
	if (jwtPayload == null || jwtPayload.permission == AccountPermission.User) return resUnauthorized();

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
	const jwtPayload = await serveOptionalSession();
	if (jwtPayload == null || jwtPayload.permission == AccountPermission.User) return resUnauthorized();

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
	const jwtPayload = await serveOptionalSession();
	if (jwtPayload == null || jwtPayload.permission == AccountPermission.User) return resUnauthorized();

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
