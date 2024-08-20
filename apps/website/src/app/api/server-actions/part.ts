"use server";

import fs from "fs";
import path from "path";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { redirect } from "next/navigation";

import db from "@/app/api/Database";
import { requestReceivedHTML, sendEmail } from "../util/Mail";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import AccountServe from "@/app/Types/Account/AccountServe";
import Account from "@/app/Types/Account/Account";
import { getModelPath } from "@/app/files";

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
	let notes = formData.get("notes") as string;
	let requestName = formData.get("requestname") as string;
	let color = formData.getAll("color") as string[];
	let material = formData.getAll("material") as string[];
	let quantity = formData.getAll("quantity") as string[];
	let notesPerPart = formData.getAll("notes") as string[];

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

	let requestId: number;

	//update database
	try {
		let success = await db.begin(async (sql) => {
			const request =
				await sql`insert into request (name, owneremail) values (${requestName}, ${account.email}) returning id`;

			requestId = Number.parseInt(request[0].id);

			const profileUploadDir = `${uploadDir}${
				path.sep
			}${account.email.substring(0, account.email.indexOf("@"))}`;

			if (!fs.existsSync(profileUploadDir)) {
				fs.mkdirSync(profileUploadDir, { recursive: true });
			}

			for (let i = 0; i < files!.length; i++) {
				let partQuantity = Number.parseInt(quantity[i]);
				// if (partQuantity > 80) {
				// 	throw new Error("Quantity cannot exceed 80");
				// }

				console.log(color[i]);

				// TODO: Replace separate filament queries with singular.
				const filamentId =
					await sql`select id from filament where ColorName=${color[i]} and Material=${material[i]} and InStock=true`;

				console.log(filamentId);

				//if no filament with matching color and material was found,
				//check if the user specified the 'Other' option in the web page (empty string == other)
				if (filamentId.length === 0 && color && material) {
					throw new Error(`No ${color} ${material} in stock`);
				}

				console.log(filenames[i]);

				// const [modelId] = await sql`insert into model (name, filepath, owneremail) values (${filenames[i]}, ${filenames[i] + ".stl"}, ${email}) returning id`;
				const modelRow =
					await sql`insert into model (name, owneremail, filesizeinbytes) values (${filenames[i]}, ${account.email}, ${files[i].size}) returning id`;

				const modelId: string = modelRow[0].id;

				const buffer = Buffer.from(await files[i].arrayBuffer());

				const modelPath = getModelPath(account.email, modelId);
				console.log(modelPath);

				fs.writeFileSync(modelPath, buffer);

				const partId = await sql`
				insert into part (requestid, modelid, quantity, assignedfilamentid) 
				values (
					${requestId}, ${modelId}, ${quantity[i]}, ${
					!filamentId ? null : filamentId[0].id
				}
				) 
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
		await sendEmail(
			account.email,
			`Request received for ${requestName}`,
			await requestReceivedHTML(
				(await RequestServe.fetchByIDWithAll(requestId!))!
			)
		);
	} catch (error) {
		console.error("Failed to send Email", error);
	}

	redirect(`/dashboard/user/${requestId!}`);
}
