import getConfig from "@/app/getConfig";
import { MachineData } from "../../components/Machine";
import "server-only";
import { resError, resOk } from "../APIResponse";

const env = getConfig();

export async function fetchMachines(): Promise<MachineData[] | null> {
	let printerData: MachineData[] | null = null;
	try {
		printerData = await (
			await fetch(`${env.farmAPIUrl}/printers`, { cache: "no-cache" })
		).json();
	} catch (ex) {
		// Do nothing.
		console.error("Failed to request information of printers!");
		return null;
	}
	return printerData!;
}

export async function findMachinesWithFilament(
	material: string,
	colorHex: string
): Promise<string[]> {
	let printerData: Record<string, any> | null = null;
	try {
		printerData = await (
			await fetch(
				`${env.farmAPIUrl}/find-available?material=${material.toUpperCase()}&color=${colorHex}`,
				{ cache: "no-cache" }
			)
		).json();
	} catch (ex) {
		// Do nothing.
		console.error(
			"Failed to request information on printers with specified filament!"
		);
	}
	return Object.keys(printerData!);
}

export async function findMachineWithFile(fileName: string): Promise<MachineData | undefined> {
	let machines = await fetchMachines();
	if (machines == null) return undefined;

	return machines.find(m => m.filename && m.filename.trim().toLowerCase() == fileName.trim().toLowerCase());
}

export async function printOnMachine(identifier: string, filename: string) {
	try {
		let actionRes = await (await fetch(`${env.farmAPIUrl}/printers/${identifier}/control/start?fileToUse=${filename}`, { cache: "no-cache", method: "POST" })).json();

		if (!actionRes.success as boolean) {
			throw new Error(actionRes.message as string);
		}
	}
	catch (ex) {
		console.error((ex as object).toString());
		return resError((ex as object).toString());
	}
	return resOk();
}

export async function controlMachine(identifier: string, action: "pause" | "stop" | "resume") {
	try {
		let actionRes = await (await fetch(`${env.farmAPIUrl}/printers/${identifier}/control/${action}`, { cache: "no-cache", method: "POST" })).json();

		if (!actionRes.success as boolean) {
			throw new Error(actionRes.message as string);
		}
	}
	catch (ex) {
		console.error((ex as object).toString());
		return resError((ex as object).toString());
	}
	return resOk();
}