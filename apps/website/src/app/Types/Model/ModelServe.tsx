import Model from "./Model";
import db from "@/app/api/Database";

export default class ModelServe {
	public static async queryById(modelId: string): Promise<Model | undefined> {
		const query = await db`SELECT * FROM Model WHERE Id=${modelId}`;
		const modelRow = query.at(0);
		if (modelRow == undefined) return;
		console.log(modelRow.filesizeinbytes);

		return {
			id: modelRow.id,
			name: modelRow.name,
			ownerEmail: modelRow.owneremail,
			fileSizeInBytes: Number.parseInt(modelRow.filesizeinbytes)
		};
	}

	public static async queryByAccount(accountEmail: string): Promise<Model[]> {
		const query =
			await db`SELECT * FROM Model WHERE OwnerEmail=${accountEmail}`;

		return query.map((modelRow) => {
			return {
				id: modelRow.id,
				name: modelRow.name,
				ownerEmail: modelRow.owneremail,
				fileSizeInBytes: Number.parseInt(modelRow.filesizeinbytes)
			};
		});
	}
}
