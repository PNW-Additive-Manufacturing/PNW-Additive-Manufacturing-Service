"use server";

import fs from "fs";
import path from "path";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { redirect } from "next/navigation";

import db from "@/app/api/Database";
import { getModelPath } from "@/app/files";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { addDays } from "@/app/utils/TimeUtils";
import { maintainerRequestReceived, sendEmail, sendRequestEmail } from "../util/Mail";

const uploadDir = path.join(process.cwd(), "uploads", "stl");

export type SubmitOrderResult = { error: string } | undefined;

export async function submitOrder(formData: FormData): Promise<SubmitOrderResult> {
	// Authenticate
	let account;
	try {
		const payload = await getJwtPayload();
		account = (await AccountServe.queryByEmail(payload!.email))!;
		if (account == undefined) throw new Error("Account is null!");
	} catch {
		return redirect("/user/login");
	}

	// Parse fields
	const orderName = (formData.get("orderName") as string)?.trim();
	const requiredByRaw = formData.get("requiredBy") as string;
	const comments = (formData.get("comments") as string) || null;
	const models = formData.getAll("models") as File[];
	const modelIndexes = formData.getAll("modelIndex") as string[];
	const filamentIds = formData.getAll("filamentId") as string[];
	const quantities = formData.getAll("quantity") as string[];
	const partNames = formData.getAll("partName") as string[];
	const specialInstructions = formData.getAll("specialInstruction") as string[];

	if (!orderName || orderName.length === 0)
		return { error: "Order name is required." };
	if (!requiredByRaw)
		return { error: "Required-by date is required." };

	const requiredBy = new Date(requiredByRaw);
	const now = new Date();
	if (isNaN(requiredBy.getTime()))
		return { error: "Invalid required-by date." };
	if (requiredBy <= now)
		return { error: "Required-by date must be in the future." };

	if (models.length === 0)
		return { error: "You must upload at least one model." };

	for (const file of models) {
		if (!file.name.toLowerCase().endsWith(".stl"))
			return { error: `File "${file.name}" must be a .stl file.` };
		if (file.size > 20_000_000)
			return { error: `File "${file.name}" exceeds the 20 MB size limit.` };
	}

	if (filamentIds.length === 0)
		return { error: "You must configure at least one part." };

	// Validate filaments and lead times
	for (let i = 0; i < filamentIds.length; i++) {
		const filamentId = Number.parseInt(filamentIds[i]);
		const filament = await FilamentServe.queryById(filamentId);
		if (filament == undefined)
			return { error: `Selected filament (ID ${filamentId}) no longer exists.` };
		if (!filament.inStock)
			return { error: `${filament.material.shortName} – ${filament.color.name} is out of stock.` };
		if (addDays(now, filament.leadTimeInDays) > requiredBy) {
			// Warn but don't block — maintainers can adjust
		}
	}

	let requestId: number;

	try {
		fs.mkdirSync(uploadDir, { recursive: true });
	} catch (e: any) {
		console.error(e);
		return { error: "Server cannot create uploads folder, try again later." };
	}

	try {
		const success = await db.begin(async (sql) => {
			// Insert the Request
			const requestRow = await sql`
				INSERT INTO Request (Name, OwnerEmail, Comments, NeedBy, FeesInCents)
				VALUES (${orderName}, ${account.email}, ${comments}, ${requiredBy}, ${0})
				RETURNING Id
			`;
			requestId = Number.parseInt(requestRow[0].id);

			const profileUploadDir = path.join(
				uploadDir,
				account.email.substring(0, account.email.indexOf("@"))
			);
			fs.mkdirSync(profileUploadDir, { recursive: true });

			// Insert each unique model file and collect id by index
			const modelIds: string[] = [];
			for (const file of models) {
				const modelRow = await sql`
					INSERT INTO Model (Name, OwnerEmail, FileSizeInBytes)
					VALUES (${file.name.replace(/\.stl$/i, "")}, ${account.email}, ${file.size})
					RETURNING Id
				`;
				const modelId: string = modelRow[0].id;
				modelIds.push(modelId);

				const buffer = Buffer.from(await file.arrayBuffer());
				const modelPath = getModelPath(account.email, modelId);
				fs.mkdirSync(path.dirname(modelPath), { recursive: true });
				fs.writeFileSync(modelPath, buffer as any);
			}

			// Insert each part
			for (let i = 0; i < filamentIds.length; i++) {
				const filamentId = Number.parseInt(filamentIds[i]);
				const modelIndex = Number.parseInt(modelIndexes[i]);
				const quantity = Number.parseInt(quantities[i]);
				const note = specialInstructions[i]?.trim() || null;

				if (quantity < 1)
					throw new Error("Quantity must be at least 1.");

				const partRow = await sql`
					INSERT INTO Part (RequestId, ModelId, Quantity, AssignedFilamentId, Note)
					VALUES (${requestId}, ${modelIds[modelIndex]}, ${quantity}, ${filamentId}, ${note})
					RETURNING Id
				`;
				if (partRow.count === 0)
					throw new Error(`Failed to insert part #${i + 1}.`);
			}

			return true;
		});

		if (!success) return { error: "Failed to submit order." };
	} catch (e: any) {
		console.error(e);
		return { error: "Failed to submit order: " + e.message };
	}

	// Send emails
	try {
		const request = (await RequestServe.fetchByIDWithAll(requestId!))!;
		sendRequestEmail("received", request);

		const maintainerEmails = await AccountServe.queryMaintainerEmails();
		sendEmail(
			maintainerEmails.join(", "),
			`Request received for ${orderName} by ${account.firstName} ${account.lastName}`,
			await maintainerRequestReceived(request)
		);
	} catch (error) {
		console.error("Failed to send email:", error);
	}

	redirect(`/dashboard/user/${requestId!}`);
}
