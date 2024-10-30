export default interface Model {
	id: string;
	name: string;
	ownerEmail: string;
	fileSizeInBytes: number;
	analysisFailedReason?: string;
	isPurged: boolean;
	analysisResults?: {
		estimatedFilamentUsedInGrams: number;
		estimatedDuration: string;
		machineModel: string;
		machineManufacturer: string;
	};
}
