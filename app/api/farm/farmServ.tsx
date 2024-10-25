import getConfig from "@/app/getConfig";
import { MachineData } from "../../components/Machine";
import "server-only";

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
				`${env.farmAPIUrl
				}/find-available?material=${material.toUpperCase()}&color=${colorHex}`,
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