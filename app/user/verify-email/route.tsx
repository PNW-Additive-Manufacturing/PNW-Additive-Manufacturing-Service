"use server";

import AccountServe from "@/app/Types/Account/AccountServe";
import { getJwtPayload, retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import db from "@/app/api/Database";
import { NextRequest, NextResponse } from "next/server";
import { AccountPermission, IsVerificationCodeExpired } from "@/app/Types/Account/Account";
import { login } from "@/app/api/util/AccountHelper";
import getConfig from "@/app/getConfig";

const envConfig = getConfig();

export async function GET(request: NextRequest) {
	const verificationToken = request.nextUrl.searchParams.get("token");
	if (verificationToken == undefined) return NextResponse.redirect(envConfig.joinHostURL("/not-found"));

	// Validate verification token.
	const verificationEntry = await AccountServe.queryEmailVerification(verificationToken);
	if (verificationEntry == undefined) return NextResponse.redirect(envConfig.joinHostURL("/user/not-verified"));

	if (IsVerificationCodeExpired(verificationEntry)) {
		// TODO: Send to awaiting verification page!
		return NextResponse.redirect(envConfig.joinHostURL("/user/not-verified"));
	}

	// Query user data!
	// JWT cannot be null due to middleware preventing non-logged users access.
	// const JWT = (await getJwtPayload())!;
	const existingJWT = await retrieveSafeJWTPayload();
	if (existingJWT == null) return NextResponse.redirect(
		envConfig.joinHostURL(`/user/login?redirect=${envConfig.joinHostURL(`/user/verify-email?token=${verificationToken}`)}&reason=You must be logged in to validate your email!`));

	// User has already been verified, so, instead we wil just send them to the email verified page for user-facing verbosity.
	if (existingJWT.isemailverified) return NextResponse.redirect(envConfig.joinHostURL("/user/email-verified"));

	if (existingJWT.email != verificationEntry?.accountEmail) {
		// Someone is attempting to use someone elses verification token!
		return NextResponse.redirect(envConfig.joinHostURL("/not-found"));
	}

	// const linkedAccount = await AccountServe.queryByEmail(verificationEntry.accountEmail);
	// if (linkedAccount == undefined) return;
	// if (linkedAccount.isEmailVerified) {
	// 	console.log("Verification has already been done!");
	// 	return NextResponse.redirect(envConfig.joinHostURL("/not-found"));
	// }

	await db.begin(async (db) => {
		await db`UPDATE account SET isemailverified=true WHERE email=${verificationEntry.accountEmail}`;
		await db`DELETE FROM accountverificationcode WHERE accountemail=${verificationEntry.accountEmail}`;
	});


	await login(
		existingJWT.email,
		existingJWT.permission as AccountPermission,
		existingJWT.firstname,
		existingJWT.lastname,
		true
	);

	return NextResponse.redirect(envConfig.joinHostURL("/user/email-verified"));
}
