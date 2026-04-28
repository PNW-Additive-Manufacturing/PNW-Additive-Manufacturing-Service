import { resOkData } from "@/app/api/APIResponse";
import { login } from "@/app/api/util/AccountHelper";
import { serveOptionalSession } from "@/app/api/util/SessionHelper";
import getConfig from "@/app/getConfig";
import AccountServe from "@/app/Types/Account/AccountServe";
import { queryInCompleteReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { NextRequest, NextResponse } from "next/server";

const envConfig = getConfig();

/**
 * GET /user/current
 * 
 * Returns current user account information and reregistration status
 * Can be called authenticated or unauthenticated
 * If authenticated, refreshes JWT if permissions/email verification/ban status changed
 */
export async function GET(request: NextRequest) 
{
	try {
		const currentJWT = await serveOptionalSession();
		if (currentJWT == null) {
			return new NextResponse(null, { status: 401 });
		}

		// Query current account state from database
		const accountDetails = await AccountServe.queryByEmail(currentJWT.email);
		if (accountDetails == null) {
			// Account deleted? Remove session
			return new NextResponse(null, { status: 401 });
		}

		const reregistration = await queryInCompleteReregistration(new Date(), currentJWT.email);

		// Detect changes: permissions, email verification, or ban status
		const isEmailVerificationChanged = currentJWT?.isemailverified != accountDetails?.isEmailVerified;
		const isPermissionChanged = currentJWT.permission != accountDetails?.permission;
		const isBannedChanged = currentJWT.isBanned != accountDetails.isBanned;

		const res = NextResponse.json(resOkData({
			account: accountDetails,
			reregistration: reregistration?.id
		}));

		// If anything changed, issue new JWT
		if (isEmailVerificationChanged || isPermissionChanged || isBannedChanged) {
			const token = await login(
				accountDetails.email,
				accountDetails.permission,
				accountDetails.firstName,
				accountDetails.lastName,
				accountDetails.isEmailVerified,
				accountDetails.isBanned
			);
			res.cookies.set(envConfig.sessionCookie, token);
		}

		return res;
	} catch (error) {
		console.error("[USER/CURRENT]", error);
		return new NextResponse(null, { status: 500 });
	}
}
