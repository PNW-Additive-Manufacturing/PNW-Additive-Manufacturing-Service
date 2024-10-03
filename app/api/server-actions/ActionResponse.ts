export interface ActionResponsePayload<T> {
	isComplete: boolean;
	data?: T;
	errorMessage?: string;
}

export default class ActionResponse {
	public static Incomplete<T>(): ActionResponsePayload<T> {
		return {
			isComplete: false,
			data: undefined,
			errorMessage: undefined
		};
	}

	public static Ok<T>(data: T): ActionResponsePayload<T> {
		return {
			isComplete: true,
			data,
			errorMessage: undefined
		};
	}

	public static Error<T>(errorMessage: string): ActionResponsePayload<T> {
		return {
			isComplete: true,
			data: undefined,
			errorMessage
		};
	}

	public static ErrorLackPermission(): ActionResponsePayload<undefined> {
		return {
			isComplete: true,
			data: undefined,
			errorMessage: "You lack permission to access this resource!"
		};
	}
}
