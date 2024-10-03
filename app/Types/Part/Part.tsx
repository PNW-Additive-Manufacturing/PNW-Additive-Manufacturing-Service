import { SwatchConfiguration } from "@/app/components/Swatch";
import Model from "../Model/Model";
import Request from "../Request/Request";
import Filament from "../Filament/Filament";
import { WalletTransaction } from "../Account/Wallet";

export type PartWithRequest = Part & { request: Request };
export type PartWithModel = Part & { model: Model };

export enum PartStatus {
	Denied = "denied",
	Pending = "pending",
	Printing = "printing",
	Printed = "printed",
	Failed = "failed"
}

export default interface Part {
	id: number;
	requestId: number;
	quantity: number;
	status: PartStatus;
	modelId: string;
	filament?: Filament;
	supplementedFilament?: Filament;
	notes?: string;
	priceInDollars?: number;
	deniedReason?: string;
	refund?: {
		quantity: number;
		reason: string;
		walletTransactionId: number;
		walletTransaction: WalletTransaction;
	};
}

export function getStatusColor(partStatus: PartStatus) {
	let selectedStatusColor;
	switch (partStatus) {
		case PartStatus.Printed:
			selectedStatusColor = "green-500";
			break;
		case PartStatus.Printing:
			selectedStatusColor = "blue-500";
			break;
		case PartStatus.Failed:
			selectedStatusColor = "red-500";
			break;
		case PartStatus.Denied:
			selectedStatusColor = "orange-400";
			break;
		default:
			selectedStatusColor = "gray-200";
			break;
	}
	return selectedStatusColor;
}

export function isFilamentSupplemented(part: Part) {
	return part.supplementedFilament != undefined;
}

export function isRevoked(part: Part) {
	return part.status == PartStatus.Denied;
}

export function isRefunded(part: Part) {
	return part.refund != undefined;
}

export function isPriced(part: Part) {
	return part.priceInDollars != undefined;
}

export function isAllComplete(parts: Part[]) {
	return parts.every((part) => part.status == "printed");
}

export function isAllPending(parts: Part[]) {
	return parts.findIndex((part) => part.status != "pending") == -1;
}
