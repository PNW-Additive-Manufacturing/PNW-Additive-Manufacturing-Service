import "server-only";
import path from "path";
import getConfig from "./getConfig";

const envConfig = getConfig();

export function getModelPath(accountEmail: string, modelId: string) {
	if (modelId == undefined) {
		throw new Error("modelId cannot be undefined when creating a path!");
	}
	if (accountEmail == undefined) {
		throw new Error(
			"accountEmail cannot be undefined when creating a path!"
		);
	}

	return `${envConfig.uploadModelDir}${path.sep}${accountEmail.substring(
		0,
		accountEmail.indexOf("@")
	)}${path.sep}${modelId}.stl`;
}
