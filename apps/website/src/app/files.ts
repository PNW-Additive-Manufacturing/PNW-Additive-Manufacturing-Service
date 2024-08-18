import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads", "stl");

export function getModelPath(accountEmail: string, modelId: string) {
	if (modelId == undefined) {
		throw new Error("modelId cannot be undefined when creating a path!");
	}
	if (accountEmail == undefined) {
		throw new Error(
			"accountEmail cannot be undefined when creating a path!"
		);
	}

	return `${uploadDir}${path.sep}${accountEmail.substring(
		0,
		accountEmail.indexOf("@")
	)}${path.sep}${modelId}.stl`;
}
