import Model from "./Model";
import db from "@/app/api/Database";

export default class ModelServe {
	public static async queryById(modelId: string): Promise<Model | undefined> {
		const query = await db`SELECT * FROM Model WHERE Id=${modelId}`;
		const modelRow = query.at(0);
		if (modelRow == undefined) return;

		const analysisQuery = (
			await db`SELECT * FROM ModelAnalysis WHERE ModelId=${modelId}`
		).at(0);

		return {
			id: modelRow.id,
			name: modelRow.name,
			ownerEmail: modelRow.owneremail,
			fileSizeInBytes: Number.parseInt(modelRow.filesizeinbytes),
			analysisFailedReason: analysisQuery?.failedreason,
			analysisResults:
				analysisQuery != undefined && analysisQuery?.failedreason == undefined
					? {
						estimatedDuration:
							analysisQuery!.estimatedduration,
						estimatedFilamentUsedInGrams: parseFloat(analysisQuery.estimatedfilamentusedingrams)
					}
					: undefined
		};
	}

	public static async queryByAccount(accountEmail: string): Promise<Model[]> {
		const query =
			await db`SELECT * FROM Model WHERE OwnerEmail=${accountEmail}`;

		return Promise.all(
			query.map(async (modelRow) => {
				const analysisQuery = (
					await db`SELECT * FROM ModelAnalysis WHERE ModelId=${modelRow.id}`
				).at(0);

				return {
					id: modelRow.id,
					name: modelRow.name,
					ownerEmail: modelRow.owneremail,
					fileSizeInBytes: Number.parseInt(modelRow.filesizeinbytes),
					analysisFailedReason: analysisQuery?.failedreason,
					analysisResults:
						analysisQuery != undefined && analysisQuery?.failedreason == undefined
							? {
								estimatedDuration:
									analysisQuery!.estimatedduration,
								estimatedFilamentUsedInGrams: parseFloat(analysisQuery.estimatedfilamentusedingrams)
							}
							: undefined
				};
			})
		);
	}
}
