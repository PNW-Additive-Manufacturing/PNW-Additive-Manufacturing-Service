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
	reasonForSupplementedFilament?: string;
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
			selectedStatusColor = "rgb(34, 197, 94)";
			break;
		case PartStatus.Printing:
			selectedStatusColor = "rgb(59, 130, 246)";
			break;
		case PartStatus.Failed:
			selectedStatusColor = "rgb(239, 68, 68)";
			break;
		case PartStatus.Denied:
			selectedStatusColor = "#ef4444";
			break;
		case PartStatus.Pending:
			selectedStatusColor = "rgb(251, 146, 60)";
			break;
		default:
			selectedStatusColor = "rgb(229, 231, 235)";
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
