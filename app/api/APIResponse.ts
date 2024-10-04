export function error(errorMessage: string): APIData<{}> {
	return {
		success: false,
		errorMessage: errorMessage
	};
}

export function unauthorized(): APIData<{}> {
	return {
		success: false,
		errorMessage: "You are not authorized to access this resource!"
	};
}

export function okData<D extends object>(data: D): APIData<D> {
	return {
		success: true,
		...data
	};
}

export type APIData<T> = { success: boolean; errorMessage?: string } & T;
