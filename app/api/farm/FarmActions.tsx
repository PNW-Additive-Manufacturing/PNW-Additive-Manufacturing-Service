"use server";

import { z } from "zod";
import { fetchMachines } from "./farmServ";
import getConfig from "../../getConfig";
import { retrieveSafeJWTPayload } from "../util/JwtHelper";

const env = getConfig();

const sliceSchema = z.object({
	infillPercentage: z.coerce.number().min(1).max(100),
	useSupports: z.coerce.boolean(),
	supportStyle: z
		.literal("tree(auto)")
		.or(z.literal("regular(auto)"))
		.nullable(),
	wallCount: z.coerce.number().min(1),
	quantity: z.coerce.number().min(1),
	layerHeight: z.coerce.number(),
	material: z.string().min(1),
	colorHex: z.string().min(1)
});

export async function uploadToFarm(prevState: any, formData: FormData) {
	// const { data: parsedData, error: schemaError } = sliceSchema.safeParse({
	// 	infillPercentage: formData.get("infillPercentage"),
	// 	useSupports: formData.get("useSupports"),
	// 	supportStyle: formData.get("supportStyle"),
	// 	wallCount: formData.get("wallCount"),
	// 	quantity: formData.get("quantity"),
	// 	layerHeight: formData.get("layerHeight"),
	// 	material: formData.get("material"),
	// 	colorHex: formData.get("colorHex")
	// });
	// if (schemaError) return `Schema Error: ${schemaError}`;

	// const stlFile = formData.get("file") as File;
	// if (stlFile == null || !stlFile.name.endsWith("stl"))
	// 	return {
	// 		success: false,
	// 		errorMessage: `Schema Error: Missing STL`
	// 	};

	// const response = await fetch(
	// 	`${env}/printers/print?fileName=${stlFile.name}f&material=${parsedData.material}&colorHex=${parsedData.colorHex}&layerHeight=${parsedData.layerHeight}&useSupports=${parsedData.useSupports}&supportStyle=${parsedData.supportStyle}&quantity=${parsedData.quantity}&wallLoops=${parsedData.wallCount}`,
	// 	{ method: "POST", body: stlFile }
	// );

	// if (response.status != 200) {
	// 	console.error(
	// 		`An unexpected error (${response.statusText} ${response.status}) occurred uploading ${stlFile.name} to Farm!\n`
	// 	);
	// 	return {
	// 		success: false,
	// 		message: `An unexpected error occurred uploading to Farm!`
	// 	};
	// }

	// const responseData = (await response.json()) as {
	// 	success: boolean;
	// 	printer: string;
	// 	message?: string;
	// };

	// return responseData;

	return {
		success: false,
		message: `Not implemented.`
	};
}

const markAsEmptySchema = z.object({
	identity: z.string()
});
export async function markAsEmpty(prevState: any, formData: FormData) {
	const parsedData = markAsEmptySchema.safeParse({
		identity: formData.get("identity")
	});
	if (!parsedData.success) {
		return `Schema Error: ${parsedData.error}`;
	}

	const JWT = await retrieveSafeJWTPayload();
	if (JWT == undefined || JWT.permission == "user") {
		return;
	}

	try {
		await fetch(
			`${env.farmAPIUrl}/printers/${parsedData.data.identity}/markAsCleared`,
			{
				method: "POST"
			}
		);
	} catch (error) {
		console.error("Issue occurred marking machine as empty!", error);
	}
}

export async function slice(
	prevState: any,
	formDate: FormData
): Promise<{
	success: boolean;
	message?: string;
	durationAsSeconds?: number;
}> {
	// const { data: parsedData, error: schemaError } = sliceSchema.safeParse({
	// 	infillPercentage: formDate.get("infillPercentage"),
	// 	useSupports: formDate.get("useSupports"),
	// 	supportStyle: formDate.get("supportStyle"),
	// 	wallCount: formDate.get("wallCount"),
	// 	quantity: formDate.get("quantity"),
	// 	layerHeight: formDate.get("layerHeight"),
	// 	material: formDate.get("material"),
	// 	colorHex: formDate.get("colorHex")
	// });
	// if (schemaError)
	// 	return {
	// 		success: false,
	// 		errorMessage: `Schema Error: ${schemaError}`
	// 	};

	// const stlFile = formDate.get("file") as File;
	// if (stlFile == null || !stlFile.name.endsWith("stl"))
	// 	return {
	// 		success: false,
	// 		errorMessage: `Schema Error: Missing STL`
	// 	};

	// const sliceResponse = await fetch(
	// 	`${env}/slicing/slice/info?fileName=${stlFile.name}f&material=${parsedData.material}&colorHex=${parsedData.colorHex}&model=X1C&manufacturer=BBL&layerHeight=${parsedData.layerHeight}&useSupports=${parsedData.useSupports}&supportStyle=${parsedData.supportStyle}&quantity=${parsedData.quantity}&wallLoops=${parsedData.wallCount}`,
	// 	{ method: "POST", body: stlFile, cache: "no-cache" }
	// );

	// if (sliceResponse.status != 200) {
	// 	console.error("Could not contact FarmAPI", sliceResponse.statusText);
	// 	return {
	// 		success: false,
	// 		errorMessage: "Could not contact FarmAPI"
	// 	};
	// }

	// let slicedData = await sliceResponse.json();

	// return {
	// 	success: true,
	// 	...slicedData
	// };

	return {
		success: false,
		message: `Not implemented.`
	};
}
