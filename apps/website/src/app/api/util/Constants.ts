export const SESSION_COOKIE = "session-token";

//because getting names of enums would otherwise require us to do
// Permission[Permission.user] to get "user"
export enum Permission 
{
	user = "user",
	maintainer = "maintainer",
	admin = "admin"
}

export interface Request {
	firstname: string,
	lastname: string,
	numberofparts: number,
	id: number,
	name: string,
	isfulfilled: boolean
	submittime: Date,
}

export interface RequestMessage 
{
	requestid: number,
	sender: string,
	content: string,
	sentat: Date
}

export interface Part {
	partid: number,
	requestid: number,
	modelid: number,
	quantity: number,
	status: string,
	modelname: string,
	filamentmaterial: string,
	filamentcolor: string
}

export const DateOptions: Intl.DateTimeFormatOptions = {
	year: "2-digit",
	month: "numeric",
	day: "numeric",
	// hour: "numeric",
	// minute: "numeric",
	hour: undefined,
	minute: undefined
};