import { object } from "zod";

export function resError<T>(errorMessage: string): APIData<T> {
	return {
		success: false,
		errorMessage: errorMessage
	};
}

export function resUnauthorized(): APIData<{}> {
	return {
		success: false,
		errorMessage: "You are not authorized to access this resource!"
	};
}

export function resOkData<D extends object>(data: D): APIData<D> {
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

export async function resAttemptAsync<R>(fun: () => Promise<R>)
{
	try
	{
		return await fun();
	}
	catch (error)
	{
		if (error instanceof Error)
		{
			return resError(error.message);
		}
		else if (error instanceof object)
		{
			return resError(error.toString())
		}
		return resError(error as string);
	}
}

export type APIData<T> = ({ success: true } & T) | ({ success: false; errorMessage?: string });
