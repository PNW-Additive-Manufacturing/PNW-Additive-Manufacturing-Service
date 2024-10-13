import postgres from "postgres";
import Model from "../Model/Model";
import Request from "../Request/Request";
import Part, { PartWithModel, PartWithRequest } from "./Part";
import db from "@/app/api/Database";
import { validateColors } from "@/app/components/Swatch";
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
			status: partRow.status,
			deniedReason: partRow.revokedreason,
			notes: partRow.notes,
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

		// const models: Array<postgres.Row> =
		// 	await db`select * from model where id in ${db(
		// 		parts.map((p) => p.modelid)
		// 	)} order by id`;
		const filaments: Array<postgres.Row> =
			await db`select * from filament where id in ${db(
				parts.map((p) => p.assignedfilamentid)
			)} order by id`;

		const parsedParts: (PartWithModel & PartWithRequest)[] = [];
		for (let partIndex in parts) {
			const partRow = parts[partIndex];

			const model = (await ModelServe.queryById(partRow.modelid))!;

			let filamentRow = filaments.find(
				(f) => f.id === partRow.assignedfilamentid
			)!;

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
				// model: {
				// 	id: model.id,
				// 	name: model.name,
				// 	ownerEmail: model.owneremail,
				// 	fileSizeInBytes: model.filesizeinbytes
				// },
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
				notes: partRow.notes,
				supplementedFilament:
					partRow.supplementedfilamentid == undefined
						? undefined
						: await FilamentServe.queryById(
								partRow.supplementedfilamentid
						  ),
				filament:
					filamentRow == undefined
						? undefined
						: FilamentServe.fromSQLRow(filamentRow)
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
