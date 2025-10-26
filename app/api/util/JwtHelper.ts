//Using jose instead of jsonwebtoken because the NextJS Edge runtime used in middleware file
//does not support most NodeJS API, such as crypto (that jsonwebtoken uses) in order to increase
//performance.
//Jose was made without depending on NodeJS API so it can be used in NextJS Edge runtime
//and also comes with optional encryption

import * as jose from "jose";

import { cookies } from "next/headers";

import Account, { AccountPermission, AccountSchema } from "@/app/Types/Account/Account";
import getConfig from "@/app/getConfig";
import { z } from "zod";

const appConfig = getConfig();

export interface UserJWT {
	email: string;
	permission: string;
	firstname: string;
	lastname: string;
	isemailverified: boolean;
	jwt_expire_date: Date;
	isBanned: boolean;
}
export const UserJWTSchema = z.object({
	email: z.email(),
	permission: z.enum(AccountPermission),
	firstname: z.string(),
	lastname: z.string(),
	isemailverified: z.boolean(),
	isbanned: z.boolean()
});
export type RefinedUserJWT = z.infer<typeof UserJWTSchema>;

export async function makeJwt(
	session: Account,
	expireDate?: Date
) {
	return await new jose.SignJWT(session)
		.setProtectedHeader({ alg: "HS512" })
		.setIssuedAt()
		.setExpirationTime(expireDate ?? "7d")
		.sign(new TextEncoder().encode(process.env.JWT_SECRET!));
}

export async function reqJWT(): Promise<Account | null> {
	let cookie = (await cookies()).get(appConfig.sessionCookie);
	if (!cookie) return null;

	try {

		const jwt = await jose.jwtVerify(cookie.value, new TextEncoder().encode(process.env.JWT_SECRET!));

		const parsedPayload = AccountSchema.parse(jwt.payload);

		return parsedPayload;

	} catch (e: any) {
		console.error(e);
		return null;
	}
}