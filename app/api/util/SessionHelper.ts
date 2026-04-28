import "server-only";

import { AccountPermission } from "@/app/Types/Account/Account";
import getConfig from "@/app/getConfig";
import * as jose from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

const appConfig = getConfig();

export interface SessionUser {
	email: string;
	permission: AccountPermission;
	firstname: string;
	lastname: string;
	isemailverified: boolean;
	jwt_expire_date: Date;
	isBanned: boolean;
}

export const SessionUserSchema = z.object({
	email: z.string().email(),
	permission: z.nativeEnum(AccountPermission),
	firstname: z.string(),
	lastname: z.string(),
	isemailverified: z.boolean(),
	isbanned: z.boolean()
});

/**
 * Reads and validates the session JWT from cookies
 * Returns parsed JWT payload or null if cookie doesn't exist/is invalid
 * @internal Use serveSession, serveRequiredSession, or serveOptionalSession instead
 */
async function readSessionCookie(): Promise<SessionUser | null> {
	const cookie = cookies().get(appConfig.sessionCookie);
	if (!cookie) return null;

	try {
		const jwt = await jose.jwtVerify(
			cookie.value,
			new TextEncoder().encode(process.env.JWT_SECRET!)
		);

		const parsedPayload = SessionUserSchema.safeParse(jwt.payload);
		if (!parsedPayload.success) {
			return null;
		}

		return {
			email: parsedPayload.data.email as string,
			permission: parsedPayload.data.permission as AccountPermission,
			firstname: parsedPayload.data.firstname as string,
			lastname: parsedPayload.data.lastname as string,
			isemailverified: parsedPayload.data.isemailverified as boolean,
			isBanned: parsedPayload.data.isbanned,
			jwt_expire_date: new Date((jwt.payload.exp ?? 0) * 1000)
		};
	} catch (e: any) {
		console.error("Invalid session token:", e.message);
		return null;
	}
}

/**
 * Get current session - returns null if not authenticated
 * Safe version that doesn't throw
 */
export async function serveOptionalSession(): Promise<SessionUser | null> {
	return await readSessionCookie();
}

/**
 * Get current session - throws if not authenticated
 * Use this to guard protected endpoints
 */
export async function serveSession(): Promise<SessionUser> {
	const session = await readSessionCookie();
	if (!session) {
		throw new Error("Unauthorized: No valid session");
	}
	return session;
}

/**
 * Get current session with permission check
 * Throws if:
 * - Not authenticated
 * - Permission level insufficient (if provided)
 * - Account is banned
 */
export async function serveRequiredSession(
	requiredPermission?: AccountPermission
): Promise<SessionUser> {
	const session = await serveSession();

	// Check if banned
	if (session.isBanned) {
		throw new Error("Forbidden: Account is banned");
	}

	// Check permission if specified
	if (requiredPermission) {
		const permissionHierarchy = {
			[AccountPermission.User]: 0,
			[AccountPermission.Maintainer]: 1,
			[AccountPermission.Admin]: 2
		};

		const userLevel = permissionHierarchy[session.permission];
		const requiredLevel = permissionHierarchy[requiredPermission];

		if (userLevel < requiredLevel) {
			throw new Error(
				`Forbidden: Insufficient permissions. Required: ${requiredPermission}, Got: ${session.permission}`
			);
		}
	}

	return session;
}

/**
 * Get current session - requires email verification
 * Throws if not authenticated or email not verified
 */
export async function serveVerifiedSession(): Promise<SessionUser> {
	const session = await serveRequiredSession();

	if (!session.isemailverified) {
		throw new Error("Forbidden: Email verification required");
	}

	return session;
}

/**
 * Get current session - admin only
 * Convenience wrapper for serveRequiredSession(Admin)
 */
export async function serveAdminSession(): Promise<SessionUser> {
	return await serveRequiredSession(AccountPermission.Admin);
}

/**
 * Get current session - maintainer or higher
 * Convenience wrapper for serveRequiredSession(Maintainer)
 */
export async function serveMaintainerSession(): Promise<SessionUser> {
	return await serveRequiredSession(AccountPermission.Maintainer);
}
