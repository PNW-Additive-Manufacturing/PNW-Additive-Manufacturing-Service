import postgres from "postgres";
import Model from "../Model/Model";
import Request from "../Request/Request";
import Part, { PartWithModel, PartWithRequest } from "./Part";
import db from "@/app/api/Database";
import ModelServe from "../Model/ModelServe";
import FilamentServe from "../Filament/FilamentServe";
import AccountServe from "../Account/AccountServe";
import assert from "assert";

// export default class PartServe implements Servable<Part>
export default class PartServe {
	public static async queryById(
		partId: number
	): Promise<PartWithModel | undefined> {
		const partQuery = await db`SELECT * FROM Part WHERE Id=${partId}`;
		const partRow = partQuery.at(0);
		if (partRow == undefined) return;

		const model = (await ModelServe.queryById(partRow.modelid))!;
		const filament = await FilamentServe.queryById(
			partRow.assignedfilamentid as number
		);

		const part: PartWithModel = {
			id: partRow.id,
			requestId: partRow.requestid,
			modelId: partRow.modelid,
			model,
			quantity: partRow.quantity,
			priceInDollars:
				partRow.pricecents == undefined
					? undefined
					: Number.parseInt(partRow.pricecents) / 100,
			supplementedFilament:
				partRow.supplementedfilamentid == undefined
					? undefined
					: await FilamentServe.queryById(
						partRow.supplementedfilamentid
					),
			reasonForSupplementedFilament: partRow.supplementedreason,
			status: partRow.status,
			deniedReason: partRow.revokedreason,
			note: partRow.note,
			refund:
				partRow.refundreason == undefined
					? undefined
					: {
						reason: partRow.refundreason,
						quantity: Number.parseInt(partRow.refundquantity),
						walletTransactionId:
							partRow.refundwallettransactionid,
						walletTransaction:
							(await AccountServe.queryTransaction(
								partRow.refundwallettransactionid
							))!
					},
			filament
		};

		return part;
	}

	public static async fetchOfRequest(
		request: Request
	): Promise<(PartWithModel & PartWithRequest)[]> {
		const parts: Array<postgres.Row> =
			await db`select * from part where RequestId=${request.id} ORDER BY Id DESC`;

		const filamentIds = Array.from(new Set(
			parts
				.flatMap((p) => [p.assignedfilamentid, p.supplementedfilamentid])
				.filter((id): id is number => id != null)
		));
		const filaments = await FilamentServe.queryByIds(filamentIds);
		const filamentById = new Map(filaments.map((f) => [f.id, f]));

		const parsedParts: (PartWithModel & PartWithRequest)[] = [];
		for (let partIndex in parts) {
			const partRow = parts[partIndex];

			const model = (await ModelServe.queryById(partRow.modelid))!;

			const priceInDollars =
				partRow.pricecents == null
					? undefined
					: Number.parseInt(partRow.pricecents) / 100;

			const part: PartWithModel & PartWithRequest = {
				id: partRow.id,
				requestId: partRow.requestid,
				request,
				modelId: partRow.modelid,
				model: model,
				deniedReason: partRow.revokedreason,
				refund:
					partRow.refundreason == undefined
						? undefined
						: {
							reason: partRow.refundreason,
							quantity: Number.parseInt(
								partRow.refundquantity
							),
							walletTransactionId:
								partRow.refundwallettransactionid,
							walletTransaction:
								(await AccountServe.queryTransaction(
									partRow.refundwallettransactionid
								))!
						},
				quantity: partRow.quantity,
				priceInDollars: priceInDollars as number | undefined,
				status: partRow.status,
				note: partRow.note,
				supplementedFilament:
					partRow.supplementedfilamentid == null
						? undefined
						: filamentById.get(partRow.supplementedfilamentid),
				reasonForSupplementedFilament: partRow.supplementedreason,
				filament:
					partRow.assignedfilamentid == null
						? undefined
						: filamentById.get(partRow.assignedfilamentid)
			};
			parsedParts.push(part);
		}
		assert(
			parsedParts.length != 0,
			"Warning, parts of request should not be zero!"
		);
		return parsedParts;
	}
}
