export default interface Model {
	id: string;
	name: string;
	ownerEmail: string;
	fileSizeInBytes: number;
	analysisFailedReason?: string;
	analysisResults?: {
		estimatedFilamentUsedInGrams: number;
		estimatedDuration: string;
	};
}
