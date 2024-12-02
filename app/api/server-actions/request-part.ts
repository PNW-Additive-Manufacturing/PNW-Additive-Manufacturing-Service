"use server";

import fs from "fs";
import path from "path";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { redirect } from "next/navigation";

import db from "@/app/api/Database";
import { maintainerRequestReceived, requestReceivedHTML, sendEmail, sendRequestEmail } from "../util/Mail";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import AccountServe from "@/app/Types/Account/AccountServe";
import Account from "@/app/Types/Account/Account";
import { getModelPath } from "@/app/files";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import { addDays, addMinutes } from "@/app/utils/TimeUtils";

const uploadDir = path.join(process.cwd(), "uploads", "stl");

export async function getFilamentList() {
	let filaments =
		await db`select material, colorname from filament where instock=true`;

	let rtn: { material: string; color: string }[] = [];

	for (let filament of filaments) {
		rtn.push({ material: filament.material, color: filament.colorname });
	}

	return rtn;
}

export async function requestPart(prevState: string, formData: FormData) {
	let account: Account;
	// TODO: Refactor this. It sucks.
	try {
		const payload = await getJwtPayload();
		account = (await AccountServe.queryByEmail(payload!.email))!;

		if (account == undefined) {
			throw new Error("Account is null!");
		}
	} catch (e) {
		return redirect("/user/login");
	}
	
	let files = formData.getAll("file") as File[] | null;
	let notes = formData.get("notes") as string | null;
	notes = notes == "" ? null : notes;
	let requestName = formData.get("requestname") as string;
	let color = formData.getAll("color") as string[];
	let material = formData.getAll("material") as string[];
	let quantity = formData.getAll("quantity") as string[];
	let notesPerPart = formData.getAll("notes") as string[];

	const needBy = new Date(formData.get("need-by") as string);

	requestName = requestName.trim();
	if (requestName == "" && files != null) {
		if (files.length > 1) {
			requestName = `${files[0].name.substring(
				0,
				files[0].name.lastIndexOf(".")
			)} & ${files.length - 1} More`;
		} else {
			requestName = files[0].name.substring(
				0,
				files[0].name.lastIndexOf(".")
			);
		}
	}

	console.log(files);
	console.log(color);
	console.log(material);
	console.log(quantity);
	console.log(notesPerPart);

	if (files == null || files.length < 1) {
		return "You must submit one or more .stl files";
	}

	console.log(`Creating request with ${files?.length} parts!`);

	let filepaths = files.map((f) => f.name);

	let nonStlFile = filepaths.find(
		(path) => !path.toLowerCase().endsWith(".stl")
	);
	if (nonStlFile) {
		return `The file ${nonStlFile} must be a .stl file`;
	}

	const anyFileTooLarge =
		files.filter((file) => file.size > 20000000).length > 0;
	if (anyFileTooLarge) {
		return `File size exceeded! Models must be under 20 MB!`;
	}

	let filenames = filepaths.map((path) =>
		path.substring(0, path.lastIndexOf("."))
	);

	try {
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
	} catch (e: any) {
		return "Error, server cannot create uploads folder, try again later!";
	}

	const createdAt = new Date();

	console.log(needBy);

	if (createdAt > needBy)
	{
		// Cheeky, should almost never happen.
		return "You are requesting your parts to be ready in the past, update when you need these parts.";
	}

	let requestId: number;

	//update database
	try {
		let success = await db.begin(async (sql) => {
			const request =
				await sql`insert into request (name, owneremail, comments, needby) values (${requestName}, ${account.email}, ${notes}, ${needBy}) returning id`;

			requestId = Number.parseInt(request[0].id);

			const profileUploadDir = `${uploadDir}${
				path.sep
			}${account.email.substring(0, account.email.indexOf("@"))}`;

			if (!fs.existsSync(profileUploadDir)) {
				fs.mkdirSync(profileUploadDir, { recursive: true });
			}

			for (let i = 0; i < files!.length; i++) {
				let partQuantity = Number.parseInt(quantity[i]);
				if (partQuantity < 1) {
					throw new Error("Quantity must at least be one!");
				}

				const filament = await FilamentServe.queryIdByNameAndMaterial(color[i], material[i], true);
				if (filament == undefined) {
					throw new Error(`${color[i]} ${material[i]} is not in stock!`);
				}

				if (addDays(createdAt, filament.leadTimeInDays) > needBy)
				{
					// This is bad news for the requester - we aren't going to do anything about it just yet.
					console.log("MEANIEEEE");
				}

				const modelRow =
					await sql`insert into model (name, owneremail, filesizeinbytes) values (${filenames[i]}, ${account.email}, ${files[i].size}) returning id`;

				const modelId: string = modelRow[0].id;

				const buffer = Buffer.from(await files[i].arrayBuffer());

				const modelPath = getModelPath(account.email, modelId);

				fs.mkdirSync(path.dirname(modelPath), {
					recursive: true
				});

				fs.writeFileSync(modelPath, buffer as any);

				const partId = await sql`
					insert into part (requestid, modelid, quantity, assignedfilamentid) 
					values (${requestId}, ${modelId}, ${quantity[i]}, ${filament.id}) 
					returning id;
				`;

				console.log(partId);

				if (partId.count == 0) {
					throw new Error(`Failed to insert part: #${i}!`);
				}
			}

			return true;
		});

		console.log(success);

		if (!success) {
			return "Failed to submit parts!";
		}
	} catch (e: any) {
		e = e as Error;
		console.error(e);
		return "Failed to Order: " + e.message;
	}

	// Send a confirmation email to the user!
	try {

		console.log("Sending Emails...");
		const request = (await RequestServe.fetchByIDWithAll(requestId!))!;

		sendRequestEmail("received", request);

		const maintainerEmails = await AccountServe.queryMaintainerEmails();
		sendEmail(maintainerEmails.join(", "), 
			`Request received for ${requestName} by ${account.firstName} ${account.lastName}`, 
			await maintainerRequestReceived(request));

		console.log("Sent!");

	} catch (error) {
		console.error("Failed to send Email", error);
	}
	redirect(`/dashboard/user/${requestId!}`);
}
