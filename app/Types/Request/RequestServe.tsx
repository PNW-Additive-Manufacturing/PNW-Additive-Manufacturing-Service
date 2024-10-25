import db from "@/app/api/Database";
import Request, { hasQuote, RequestEmail, RequestWithParts } from "./Request";
import PartServe from "../Part/PartServe";
import postgres from "postgres";
import { WalletTransactionStatus } from "../Account/Wallet";
import { assert } from "console";

export interface RequestQuery {
	accountEmail?: string;
	requestedAfter?: Date;
	includeFulfilled: boolean;
	requestsPerPage: number;
	page: number;
}

// export class RequestServe implements Servable<Request>
export class RequestServe {
	public static async query(
		query: RequestQuery
	): Promise<RequestWithParts[]> {
		const dbQuery = await db`SELECT r.Id, 
		r.Name, 
		r.Comments,
		r.OwnerEmail,
		a.FirstName, 
		a.LastName, 
		r.SubmitTime,
		r.FulfilledAt, 
		r.TotalPriceInCents,
		r.PaidAt,
		r.EstimatedCompletionDate,
		COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		WHERE 
        ${!query.includeFulfilled ? db`r.FulfilledAt IS NULL` : db`TRUE`}
        ${query.accountEmail
				? db`AND r.OwnerEmail = ${query.accountEmail}`
				: db``
			}
        ${query.requestedAfter
				? db`AND r.SubmitTime >= ${query.requestedAfter}`
				: db``
			}
		GROUP BY r.Id, r.Name, r.Comments, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt, r.EstimatedCompletionDate
		ORDER BY r.SubmitTime DESC
		LIMIT ${query.requestsPerPage} OFFSET ${(query.page - 1) * query.requestsPerPage
			}; `;

		if (dbQuery.length == 0) return [];

		const requests: RequestWithParts[] = [];
		for (let requestRow of dbQuery) {
			const refundQuery =
				await db`SELECT * FROM RequestRefund WHERE RequestId = ${requestRow.id} `;

			let request: Request = {
				id: requestRow.id,
				name: requestRow.name,
				comments: requestRow.comments,
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
							),
							estimatedCompletionDate: requestRow.estimatedcompletiondate
						}
						: undefined,
				refundRequest:
					refundQuery.length > 0
						? {
							requestedAt: refundQuery.at(0)!.requestedat,
							completedAt: refundQuery.at(0)!.completedat,
							reason: refundQuery.at(0)!.reason
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

	public static async fetchByIDWithAll(
		id: string | number
	): Promise<RequestWithParts | undefined> {
		const query = await db`SELECT r.Id,
	r.Name,
	r.Comments,
	r.OwnerEmail,
	a.FirstName,
	a.LastName,
	r.SubmitTime,
	r.FulfilledAt,
	r.TotalPriceInCents,
	r.PaidAt,
	r.EstimatedCompletionDate,
	COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		WHERE r.Id = ${id}
		GROUP BY r.Id, r.Name, r.Comments, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt, r.EstimatedCompletionDate
		ORDER BY r.SubmitTime DESC; `;

		if (query.length == 0) return undefined;

		const requestRow = query.at(0)!;

		const refundQuery =
			await db`SELECT * FROM RequestRefund WHERE RequestId = ${id} `;

		let request: Request = {
			id: requestRow.id,
			comments: requestRow.comments,
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
						),
						estimatedCompletionDate: requestRow.estimatedcompletiondate
					}
					: undefined,
			refundRequest:
				refundQuery.length > 0
					? {
						requestedAt: refundQuery.at(0)!.requestedat,
						completedAt: refundQuery.at(0)!.completedat,
						reason: refundQuery.at(0)!.reason
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
	r.Comments,
	r.OwnerEmail,
	a.FirstName,
	a.LastName,
	r.SubmitTime,
	r.FulfilledAt,
	r.TotalPriceInCents,
	r.PaidAt,
	r.EstimatedCompletionDate,
	COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		GROUP BY r.Id, r.Name, r.Comments, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt, r.EstimatedCompletionDate
		ORDER BY r.SubmitTime DESC; `;

		if (query.length == 0) return [];

		const requests: RequestWithParts[] = [];
		for (let requestRow of query) {
			const refundQuery =
				await db`SELECT * FROM RequestRefund WHERE RequestId = ${requestRow.id} `;

			let request: Request = {
				id: requestRow.id,
				name: requestRow.name,
				firstName: requestRow.firstname,
				lastName: requestRow.lastname,
				comments: requestRow.comments,
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
							),
							estimatedCompletionDate: requestRow.estimatedcompletiondate
						}
						: undefined,
				refundRequest:
					refundQuery.length > 0
						? {
							requestedAt: refundQuery.at(0)!.requestedat,
							completedAt: refundQuery.at(0)!.completedat,
							reason: refundQuery.at(0)!.reason
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
	r.Comments,
	r.OwnerEmail,
	a.FirstName,
	a.LastName,
	r.SubmitTime,
	r.FulfilledAt,
	r.TotalPriceInCents,
	r.PaidAt,
	r.EstimatedCompletionDate,
	COUNT(p.Quantity) AS NumberOfParts
		FROM Request r
		LEFT JOIN Part p ON r.Id = p.RequestId
		JOIN Account a ON r.OwnerEmail = a.Email
		WHERE a.Email = ${accountEmail}
		GROUP BY r.Id, r.Name, r.Comments, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.FulfilledAt, r.TotalPriceInCents, r.PaidAt, r.EstimatedCompletionDate
		ORDER BY r.SubmitTime DESC; `;

		if (query.length == 0) return [];

		const requests: RequestWithParts[] = [];
		for (let requestRow of query) {
			const refundQuery =
				await db`SELECT * FROM RequestRefund WHERE RequestId = ${requestRow.id} `;

			let request: Request = {
				id: requestRow.id,
				name: requestRow.name,
				firstName: requestRow.firstname,
				lastName: requestRow.lastname,
				comments: requestRow.comments,
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
							),
							estimatedCompletionDate: requestRow.estimatedcompletiondate
						}
						: undefined,
				refundRequest:
					refundQuery.length > 0
						? {
							requestedAt: refundQuery.at(0)!.requestedat,
							completedAt: refundQuery.at(0)!.completedat,
							reason: refundQuery.at(0)!.reason
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

	public static async setQuote(requestId: number, amountInCents: number, estimatedCompletion: Date) {
		const request = await RequestServe.fetchByIDWithAll(requestId);
		if (request == undefined) throw new Error("Request does not exist!");
		if (hasQuote(request) && request.quote!.isPaid) {
			throw new Error("Quote cannot be modified after payment!");
		}
		await db`UPDATE Request SET TotalPriceInCents = ${amountInCents}, EstimatedCompletionDate = ${estimatedCompletion} WHERE Id = ${requestId} `;
	}

	public static async setAsPaid(
		requestId: number,
		dbContext?: postgres.Sql<{}>
	) {
		dbContext = dbContext ?? db;

		await dbContext`UPDATE Request SET PaidAt = NOW() WHERE Id = ${requestId} `;
	}

	public static async setAsFulfilled(
		requestId: number,
		dbContext?: postgres.Sql<{}>
	) {
		dbContext = dbContext ?? db;

		await dbContext`UPDATE Request SET FulfilledAt = NOW() WHERE Id = ${requestId} `;
	}

	public static async createSuccessfulEmail(id: string, emailKind: RequestEmail["kind"], requestId: number, dbContext?: postgres.Sql<{}>) {
		await (dbContext ?? db)`INSERT INTO RequestEmail (Id, Kind, RequestId, SentAt) VALUES (${id}, ${emailKind}, ${requestId}, NOW())`;
	}

	public static async createFailedEmail(emailKind: RequestEmail["kind"], requestId: number, failedReason: string, dbContext?: postgres.Sql<{}>) {
		await (dbContext ?? db)`INSERT INTO RequestEmail (Kind, RequestId, FailedReason) VALUES (${emailKind}, ${requestId}, ${failedReason})`;
	}

	public static async seenEmail(trackingId: string): Promise<boolean> {
		return (await db`UPDATE RequestEmail SET SeenAt=NOW() WHERE Id=${trackingId}`).length > 0;
	}

	public static async getEmails(requestId: number) {
		return (await db`SELECT * FROM RequestEmail WHERE RequestId=${requestId} ORDER BY SentAt DESC`).map(query => {
			return {
				id: query.id,
				kind: query.kind,
				requestId: query.requestid,
				failedReason: query.failedreason,
				sentAt: query.sentat,
				seenAt: query.seenat
			}
		});
	}

	public static async delete(
		requestId: number,
		dbContext?: postgres.Sql<{}>
	) {
		dbContext = dbContext ?? db;

		await dbContext`DELETE FROM Request WHERE Id = ${requestId} `;
	}
}
