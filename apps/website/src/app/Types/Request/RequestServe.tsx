import db from "@/app/api/Database";
import Request, { hasQuote, RequestWithParts } from "./Request";
import PartServe from "../Part/PartServe";
import postgres from "postgres";
import { WalletTransactionStatus } from "../Account/Wallet";
import { assert } from "console";

// export class RequestServe implements Servable<Request>
export class RequestServe {
	public static async fetchByIDWithAll(
		id: string | number
	): Promise<RequestWithParts | undefined> {
		const query = await db`SELECT r.Id, 
		r.Name, 
		r.OwnerEmail,
		a.FirstName, 
		a.LastName, 
		r.SubmitTime,
		r.FulfilledAt, 
		r.TotalPriceInCents,
		r.PaidAt,
		COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		WHERE r.Id = ${id}
		GROUP BY r.Id, r.Name, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt
		ORDER BY r.SubmitTime DESC;`;

		if (query.length == 0) return undefined;

		const requestRow = query.at(0)!;

		let request: Request = {
			id: requestRow.id,
			name: requestRow.name,
			firstName: requestRow.firstname,
			lastName: requestRow.lastname,
			isFulfilled: requestRow.fulfilledat != undefined,
			fulfilledAt: requestRow.fulfilledat,
			submitTime: requestRow.submittime,
			requesterEmail: requestRow.owneremail,
			quote:
				requestRow.totalpriceincents != undefined
					? {
							isPaid: requestRow.paidat != undefined,
							paidAt: requestRow.paidat,
							totalPriceInCents: Number.parseInt(
								requestRow.totalpriceincents
							)
					  }
					: undefined
		};

		const requestWithParts: RequestWithParts = {
			...request,
			parts: await PartServe.fetchOfRequest(request)
		};
		return requestWithParts;
	}

	public static async fetchAll(): Promise<RequestWithParts[]> {
		const query = await db`SELECT r.Id, 
		r.Name, 
		r.OwnerEmail,
		a.FirstName, 
		a.LastName, 
		r.SubmitTime,
		r.FulfilledAt, 
		r.TotalPriceInCents,
		r.PaidAt,
		COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		GROUP BY r.Id, r.Name, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt
		ORDER BY r.SubmitTime DESC;`;

		if (query.length == 0) return [];

		const requests: RequestWithParts[] = [];
		for (let requestRow of query) {
			let request: Request = {
				id: requestRow.id,
				name: requestRow.name,
				firstName: requestRow.firstname,
				lastName: requestRow.lastname,
				submitTime: requestRow.submittime,
				requesterEmail: requestRow.owneremail,
				isFulfilled: requestRow.fulfilledat != undefined,
				fulfilledAt: requestRow.fulfilledat,
				quote:
					requestRow.totalpriceincents != undefined
						? {
								isPaid: requestRow.paidat != undefined,
								paidAt: requestRow.paidat,
								totalPriceInCents: Number.parseInt(
									requestRow.totalpriceincents
								)
						  }
						: undefined
			};

			requests.push({
				...request,
				parts: await PartServe.fetchOfRequest(request)
			});
		}
		return requests;
	}

	public static async fetchAllByAccount(
		accountEmail: string
	): Promise<RequestWithParts[]> {
		const query = await db`SELECT r.Id, 
		r.Name, 
		r.OwnerEmail,
		a.FirstName, 
		a.LastName, 
		r.SubmitTime,
		r.FulfilledAt,
		r.TotalPriceInCents,
		r.PaidAt,
		COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		WHERE a.Email = ${accountEmail}
		GROUP BY r.Id, r.Name, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt
		ORDER BY r.SubmitTime DESC;`;

		if (query.length == 0) return [];

		const requests: RequestWithParts[] = [];
		for (let requestRow of query) {
			let request: Request = {
				id: requestRow.id,
				name: requestRow.name,
				firstName: requestRow.firstname,
				lastName: requestRow.lastname,
				isFulfilled: requestRow.fulfilledat != undefined,
				fulfilledAt: requestRow.fulfilledat,
				submitTime: requestRow.submittime,
				requesterEmail: requestRow.owneremail,
				quote:
					requestRow.totalpriceincents != undefined
						? {
								isPaid: requestRow.paidat != undefined,
								paidAt: requestRow.paidat,
								totalPriceInCents: Number.parseInt(
									requestRow.totalpriceincents
								)
						  }
						: undefined
			};

			const parts = await PartServe.fetchOfRequest(request);

			requests.push({
				...request,
				parts: parts
			});
		}
		return requests;
	}

	public static async setQuote(requestId: number, amountInCents: number) {
		const request = await RequestServe.fetchByIDWithAll(requestId);
		if (request == undefined) throw new Error("Request does not exist!");
		if (hasQuote(request) && request.quote!.isPaid) {
			throw new Error("Quote cannot be modified after payment!");
		}
		await db`UPDATE Request SET TotalPriceInCents=${amountInCents} WHERE Id=${requestId}`;
	}

	public static async setAsPaid(
		requestId: number,
		dbContext?: postgres.Sql<{}>
	) {
		dbContext = dbContext ?? db;

		await dbContext`UPDATE Request SET PaidAt=NOW() WHERE Id=${requestId}`;
	}

	public static async delete(
		requestId: number,
		dbContext?: postgres.Sql<{}>
	) {
		dbContext = dbContext ?? db;

		await dbContext`DELETE FROM Request WHERE Id=${requestId}`;
	}
}
