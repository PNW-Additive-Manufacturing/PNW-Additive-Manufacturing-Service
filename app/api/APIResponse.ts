import { object } from "zod";

export function resError<T>(errorMessage: string): APIData<T> {
	return {
		success: false,
		errorMessage: errorMessage
	};
}

export function resUnauthorized<D>(): APIData<D> {
	return {
		success: false,
		errorMessage: "You are not authorized to access this resource!"
	};
}

export function resOkData<D>(data: D): APIData<D> {
	return {
		success: true,
		...data
	};
}

export function resOk(): APIData<{}> {
	return {
		success: true
	};
}

export async function resAttemptAsync<D extends Record<string, any>>(fun: () => Promise<APIData<D>>): Promise<APIData<D>> {
	try {
		return await fun();
	}
	catch (error) {
		if (error instanceof Error) {
			return resError(error.message);
		}
		else if (error instanceof object) {
			return resError(error.toString())
		}
		return resError(error as string);
	}
}

export type APIData<T> = ({ success: true } & T) | ({ success: false; errorMessage?: string });
