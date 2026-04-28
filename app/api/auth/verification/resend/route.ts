import { resError, resOk } from "@/app/api/APIResponse";
import db from "@/app/api/Database";
import { sendVerificationEmail } from "@/app/api/util/Mail";
import { serveRequiredSession } from "@/app/api/util/SessionHelper";
import AccountServe from "@/app/Types/Account/AccountServe";
import * as crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verification/resend
 * 
 * Resend verification email to authenticated user
 * 
 * Request body:
 * - (empty, uses session email)
 * 
 * Response:
 * - 200: Verification email sent (or resent)
 * - 401: Not authenticated
 * - 400: User already verified or account not found
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		// Require authenticated session
		const session = await serveRequiredSession();

		// Check if user already verified
		const account = await AccountServe.queryByEmail(session.email);
		if (!account) {
			return NextResponse.json(
				resError("Account not found"),
				{ status: 400 }
			);
		}

		if (account.isEmailVerified) {
			return NextResponse.json(
				resError("Email is already verified"),
				{ status: 400 }
			);
		}

		// Generate new verification code
		const verificationCode = crypto.randomBytes(16).toString("hex");

		// Delete existing code and create new one
		await db.begin(async (db) => {
			await db`DELETE FROM accountverificationcode WHERE accountemail=${session.email}`;
			await db`INSERT INTO accountverificationcode (accountemail, code) VALUES (${session.email}, ${verificationCode})`;
		});

		// Send verification email
		const emailSent = await sendVerificationEmail(
			session.email,
			verificationCode,
			session.firstname,
			session.lastname
		);

		if (!emailSent) {
			return NextResponse.json(
				resError("Failed to send verification email. Please try again later."),
				{ status: 500 }
			);
		}

		return NextResponse.json(resOk());

	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return NextResponse.json(
					resError("Authentication required"),
					{ status: 401 }
				);
			}

			console.error("[VERIFICATION RESEND]", error.message);
			return NextResponse.json(
				resError(error.message),
				{ status: 400 }
			);
		}

		console.error("[VERIFICATION RESEND] Unknown error:", error);
		return NextResponse.json(
			resError("Failed to resend verification email"),
			{ status: 500 }
		);
	}
}
