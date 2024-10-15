//Using jose instead of jsonwebtoken because the NextJS Edge runtime used in middleware file
//does not support most NodeJS API, such as crypto (that jsonwebtoken uses) in order to increase
//performance.
//Jose was made without depending on NodeJS API so it can be used in NextJS Edge runtime
//and also comes with optional encryption

import * as jose from "jose";

import { cookies } from "next/headers";

import { z } from "zod";
import { permission } from "process";
import { AccountPermission } from "@/app/Types/Account/Account";
import getConfig from "@/app/getConfig";

const appConfig = getConfig();

export interface UserJWT {
	email: string;
	permission: string;
	firstname: string;
	lastname: string;
	isemailverified: boolean;
	jwt_expire_date: Date;
}
export const UserJWTSchema = z.object({
	email: z.string().email(),
	permission: z.nativeEnum(AccountPermission),
	firstname: z.string(),
	lastname: z.string(),
	isemailverified: z.boolean()
});

export async function makeJwt(
	email: string,
	permission: string,
	firstname: string,
	lastname: string,
	isemailverified: boolean,
	expireDate?: Date
) {
	if (isemailverified == undefined)
		throw new Error("IsEmailVerified is missing!");

	return await new jose.SignJWT({
		email,
		permission,
		firstname,
		lastname,
		isemailverified: isemailverified
	})
		.setProtectedHeader({ alg: "HS512" })
		.setIssuedAt()
		.setExpirationTime(expireDate ?? "7d")
		.sign(new TextEncoder().encode(process.env.JWT_SECRET!));
}

export async function getJwtPayload(): Promise<UserJWT> {
	let cookie = cookies().get(appConfig.sessionCookie);
	if (cookie == undefined) throw new Error("Session cookie is undefined");

	try {
		let jwt = await jose.jwtVerify(
			cookie.value,
			new TextEncoder().encode(process.env.JWT_SECRET!)
		);

		const parsedPayload = UserJWTSchema.safeParse(jwt.payload);
		if (!parsedPayload.success) {
			throw new Error("Session was not validated correctly");
		}

		//console.log(new Date((payload.exp ?? 0) * 1000));
		return {
			email: parsedPayload.data.email as string,
			permission: parsedPayload.data.permission as string,
			firstname: parsedPayload.data.firstname as string,
			lastname: parsedPayload.data.lastname as string,
			isemailverified: parsedPayload.data.isemailverified as boolean,
			//JWT stores their expiration dates in SECONDS, not milliseconds like Javascript Date
			jwt_expire_date: new Date((jwt.payload.exp ?? 0) * 1000)
		};
	} catch (e: any) {
		throw new Error("Invalid Token! Log Back In!");
	}
}

export async function retrieveSafeJWTPayload(): Promise<UserJWT | null> {
	let cookie = cookies().get(appConfig.sessionCookie);
	if (!cookie) return null;

	try {
		let jwt = await jose.jwtVerify(
			cookie.value,
			new TextEncoder().encode(process.env.JWT_SECRET!)
		);

		const parsedPayload = UserJWTSchema.safeParse(jwt.payload);
		if (!parsedPayload.success) {
			console.error(
				"JWT payload is invalid!",
				parsedPayload.error.message
			);
			return null;
		}

		//console.log(new Date((payload.exp ?? 0) * 1000));
		return {
			email: parsedPayload.data.email as string,
			permission: parsedPayload.data.permission as string,
			firstname: parsedPayload.data.firstname as string,
			lastname: parsedPayload.data.lastname as string,
			isemailverified: parsedPayload.data.isemailverified as boolean,
			//JWT stores their expiration dates in SECONDS, not milliseconds like Javascript Date
			jwt_expire_date: new Date((jwt.payload.exp ?? 0) * 1000)
		};
	} catch (e: any) {
		console.error(e);
		return null;
	}
}
