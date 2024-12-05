import { addDays } from "@/app/utils/TimeUtils";
import Part, {
	isAllComplete,
	isAllPending,
	isPriced,
	isRefunded,
	PartStatus,
	PartWithModel
} from "../Part/Part";
import { isBusy, MachineData } from "@/app/components/Machine";

export type RequestWithParts = Request & { parts: PartWithModel[] };

export type RequestWithEmails = Request & { emails: RequestEmail[] };

export default interface Request {
	id: number;
	firstName: string;
	lastName: string;
	requesterEmail: string;
	comments?: string;
	needBy: Date;
	quote?: {
		isPaid: boolean;
		paidAt: Date;
		totalPriceInCents: number;
		estimatedCompletionDate: Date,
	};
	refundRequest?: {
		requestedAt: Date;
		completedAt?: Date;
		reason?: string;
	};
	isFulfilled: boolean;
	fulfilledAt?: Date;
	submitTime: Date;
	name: string;
}

export interface RequestEmail {
	id: number;
	requestId: number;
	kind: "received" | "quoted" | "approved" | "completed",
	failedReason?: string;
	sentAt?: Date;
	seenAt?: Date;
}

/**
 * Request return or refund window since purchase in number of days.
 */
export const RequestReturnWindow = 30;
export function getLastRefundDate(request: Request) {
	return new Date(
		request.submitTime.getTime() + 86400000 * RequestReturnWindow
	);
}
export function isRefundAvailable(request: Request) {
	return (
		request.isFulfilled &&
		getLastRefundDate(request) >= new Date(Date.now())
	);
}

export function getRequestStatus(request: RequestWithParts): string {
	if (request.parts.length == 0) {
		throw new Error("Parts cannot be zero!");
	}

	if (request.isFulfilled) return "Fulfilled";
	if (isAllComplete(request.parts)) return "Available for Pickup";
	if (isPaid(request)) {
		if (isAllPending(request.parts)) {
			return "Queued for Processing";
		} else return "Processing";
	}
	if (hasQuote(request)) return "Waiting for Payment";
	if (isAnyPartDenied(request)) return "Action Required";
	return "Waiting for Quote";
}

export function getRequestStatusColor(request: RequestWithParts) {
	switch (getRequestStatus(request)) {
		case "Fulfilled":
			return "rgb(34 197 94)";
		case "Available for Pickup":
			return "rgb(34 197 94)";
		case "Queued for Processing":
			return "rgb(162, 165, 171)";
		case "Processing":
			return "rgb(59 130 246)";
		case "Waiting for Payment":
			return "rgb(162, 165, 171)";
		case "Action Required":
			return "rgb(251 146 60)";
		default:
			return "rgb(162, 165, 171)";
	}
}

export function isAnyPartDenied(request: RequestWithParts): boolean {
	return (
		request.parts.find((part) => part.deniedReason != undefined) !=
		undefined
	);
}

export function calculatePercentagePrinted(request: RequestWithParts): number {
	return (
		(request.parts.filter((part) => part.status == PartStatus.Printed)
			.length /
			request.parts.length) *
		100
	);
}

export function isAllPriced(request: RequestWithParts) {
	return request.parts.every((p) => p.priceInDollars != undefined);
}

export function hasQuote(request: Request): boolean {
	return request.quote != undefined;
}

export function isPaid(request: Request) {
	return hasQuote(request) && request.quote!.isPaid;
}

export function getTotalCost(request: RequestWithParts): {
	totalCost: number;
	totalRefunded: number;
	fees: number;
} {
	let totalCost = 0;
	let totalRefunded = 0;
	for (let part of request.parts) {
		if (part.priceInDollars == undefined) {
			throw new TypeError(
				"Unable to calculate total, pricing has not been determined on part!"
			);
		}
		totalCost += part.priceInDollars * part.quantity;
		if (isRefunded(part)) {
			totalRefunded += part.refund!.quantity * part.priceInDollars;
		}
	}
	// TODO: Fees & Taxes
	return {
		fees: 0,
		totalCost: totalCost - totalRefunded,
		totalRefunded
	};
}

export function getLeadTimeInDays(leadTimes: number[]) {
	return leadTimes.sort((a, b) => b - a).at(0);
}

export function getRequestLeadTimeInDays(request: RequestWithParts) {
	return getLeadTimeInDays(request.parts.map(p => p.filament) as any);
}

export function getLeadTimeDate(currentDate: Date, leadTimes: number[]): Date {
	return leadTimes.length > 0 ? addDays(currentDate, getLeadTimeInDays(leadTimes)!) : currentDate;
}

export function isPrintingOnMachines(request: RequestWithParts, machines: MachineData[]): boolean {
	for (var part of request.parts) {
		if (machines.find(m => isBusy(m) && m.filename && m.filename.toLowerCase().includes(part.model.name.toLowerCase()))) {
			return true;
		}
	}
	return false;
}