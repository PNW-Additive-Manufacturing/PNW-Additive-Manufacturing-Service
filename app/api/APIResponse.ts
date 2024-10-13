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

export type APIData<T> = ({ success: true } & T) | ({ success: false; errorMessage?: string });
