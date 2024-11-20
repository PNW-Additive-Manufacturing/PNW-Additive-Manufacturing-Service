"use server";

import { attemptLogin, checkIfPasswordCorrect, createAccount, login, validatePassword } from "@/app/api/util/AccountHelper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getJwtPayload, retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import { cookies } from "next/headers";
import db from "@/app/api/Database";
import { hashAndSaltPassword } from "../util/PasswordHelper";
import { AccountPermission, emailVerificationExpirationDurationInDays } from "@/app/Types/Account/Account";
import ActionResponse, { ActionResponsePayload } from "./ActionResponse";
import { z } from "zod";
import AccountServe from "@/app/Types/Account/AccountServe";
import { fundsAdded, sendEmail, verifyEmailTemplate } from "../util/Mail";
import getConfig from "@/app/getConfig";
import { APIData, resOkData, resError, resOk } from "../APIResponse";
import { addMinutes } from "@/app/utils/TimeUtils";
import { NextResponse } from "next/server";
import { WalletTransaction, WalletTransactionPaymentMethod, WalletTransactionStatus } from "@/app/Types/Account/Wallet";

const envConfig = getConfig();

export async function tryLogin(prevState: string, formData: FormData) {
	try {
		await attemptLogin(
			formData.get("email") as string,
			formData.get("password") as string
		);
		revalidatePath("/");
	} catch (e: any) {
		//e must be any because Typescript is stupid when it comes to try catch
		return (e as Error).message;
	}

	//note that next redirect will intentionally throw an error in order to start redirecting
	//WARNING: if in a try/catch, it will not work
	let permission = (await getJwtPayload())?.permission;
	//no error checking for Jwt payload since used just logged in
	
	const wantedRedirect = formData.get("redirect") as string;
	if (wantedRedirect && wantedRedirect.startsWith(envConfig.hostURL))
	{
		console.log(`Redirecting to ${wantedRedirect}`);

		redirect(wantedRedirect);
	}
	else
	{
		redirect("/");
	}
}

const createAccountSchema = z.object({
	email: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	password: z.string(),
	yearOfStudy: z.string()
});
export async function tryCreateAccount(prevState: string, formData: FormData) {
	const parsedData = createAccountSchema.safeParse({
		email: formData.get("email"),
		firstName: formData.get("firstname"),
		lastName: formData.get("lastname"),
		password: formData.get("password"),
		yearOfStudy: formData.get("year-of-study")
	});
	if (!parsedData.success) return `Schema Failed: ${parsedData.error}`;

	//if password does not match confirm password, send back error
	if (
		(formData.get("password") as string) !==
		(formData.get("confirm-password") as string)
	) {
		return "Password in field does not match Check Password field";
	}

	try {
		await createAccount(
			parsedData.data.email,
			parsedData.data.firstName,
			parsedData.data.lastName,
			parsedData.data.password,
			AccountPermission.User,
			parsedData.data.yearOfStudy
		);
		revalidatePath("/");
	} catch (e: any) {
		//e must be any because Typescript is stupid when it comes to try catch
		return (e as Error).message;
	}

	//use try-catch in case JWT is invalid
	let jwtPayload;
	try {
		jwtPayload = await getJwtPayload();
		if (jwtPayload == null) {
			throw new Error();
		}
	} catch (e) {
		redirect("/user/login");
	}
	//remember not to use redirect in try block unless checking if catch(e) has e.message == "NEXT_REDIRECT"
	redirect(`/`);
}

export async function logout() {
	console.log("Logout");
	cookies().delete(envConfig.sessionCookie);
}

export async function changePermission(
	prevState: string,
	formData: FormData
): Promise<string> {
	console.log("changing permission");
	let newPermission = formData.get("new-permission") as AccountPermission;
	let userEmail = formData.get("user-email") as string;

	try {
		let res =
			await db`update account set permission=${newPermission} where email=${userEmail} returning email`;
		if (res.count == 0) {
			throw new Error("Failed to update account!");
		}
	} catch (e) {
		console.error(e);
		return "Failed to update permission on user!";
	}

	return "";
}

export async function getUserInfo(email: string): Promise<any | null> {
	let res;
	res =
		await db`select firstname, lastname from account where email=${email}`;
	if (res.count === 0) {
		throw new Error("No user exists with this email!");
	}
	return {
		firstname: res[0].firstname,
		lastname: res[0].lastname
	};
}

export async function editName(
	prevState: string,
	formData: FormData
): Promise<string> {
	let fname = formData.get("firstname") as string;
	let lname = formData.get("lastname") as string;

	//use try-catch in case JWT is invalid
	let jwtPayload;
	try {
		jwtPayload = await getJwtPayload();
		if (jwtPayload == null) {
			throw new Error();
		}
	} catch (e) {
		redirect("/user/login");
	}

	let res =
		await db`update account set firstname=${fname}, lastname=${lname} where email=${jwtPayload.email} returning isemailverified`;
	if (res.count === 0) {
		return "Email does not exist!";
	}

	await login(
		jwtPayload.email,
		jwtPayload.permission as AccountPermission,
		fname,
		lname,
		res.at(0)!.isemailverified as boolean,
		jwtPayload.isBanned
	);

	return "";
}

export async function resendVerificationLink(
	prevState: ActionResponse,
	formData: FormData
): Promise<ActionResponsePayload<{ sentAt: Date; validUntil: Date }>> {
	let JWTPayload = await retrieveSafeJWTPayload();
	if (JWTPayload == null) return ActionResponse.Error("Not Authenticated!");
	if (JWTPayload!.isemailverified)
		return ActionResponse.Error("Email has already been verified!");

	try {
		const verificationEntry = await AccountServe.recreateVerificationCode(
			JWTPayload.email
		);
		console.log(
			"Message ID",
			await sendEmail(
				JWTPayload.email,
				"Confirm your Email",
				await verifyEmailTemplate(
					`${envConfig.hostURL}/user/verify-email/?token=${verificationEntry.code}`
				)
			)
		);
	} catch (error) {
		console.error("An error occurred processing email!", error);
		return ActionResponse.Error("An error occurred processing email!");
	}

	const validUntil = new Date(
		Date.now() + emailVerificationExpirationDurationInDays * 86400000
	);

	return ActionResponse.Ok({
		sentAt: new Date(),
		validUntil
	});
}

export async function sendPasswordResetEmail(
	prevState: ActionResponse,
	formData: FormData
): Promise<APIData<{ validUntil: Date }>> {
	const parsedEmail = z.string().email().safeParse(formData.get("email"));
	if (!parsedEmail.success) return resError(parsedEmail.error.toString());

	try {
		return resOkData(await AccountServe.sendPasswordReset(parsedEmail.data));
	} catch (error) {
		console.error(error);
		// return resError("An issue occurred sending a password reset request!");
		return resError(`${error}`);
	}
}

const resetPasswordSchema = z.object({
	newPassword: z.string(),
	code: z.string()
});
export async function resetPassword(prevState: ActionResponse, formData: FormData): Promise<APIData<{}>> {
	const parsedForm = resetPasswordSchema.safeParse({
		newPassword: formData.get("new-password"),
		code: formData.get("code")
	});
	if (!parsedForm.success) return resError(parsedForm.error.toString());

	// Query a password reset request with the given code.
	const passwordReset = (await db`SELECT * FROM AccountPasswordResetCode WHERE Code=${parsedForm.data.code}`).at(0);
	if (passwordReset == null || new Date() > addMinutes(passwordReset.createdat as Date, envConfig.accountPasswordResetExpiration)) {
		redirect(`${envConfig.hostURL}/not-found`);
	}

	const passwordResetAccountEmail = passwordReset.accountemail as string;

	const passwordIssues = validatePassword(parsedForm.data.newPassword);
	if (passwordIssues != null) return resError(passwordIssues);

	try {
		await db.begin(async (dbTransaction) => {
			await dbTransaction`UPDATE Account SET Password=${hashAndSaltPassword(parsedForm.data.newPassword)} WHERE Email=${passwordResetAccountEmail}`;
			await dbTransaction`DELETE FROM AccountPasswordResetCode WHERE Code=${parsedForm.data.code}`;
		});

		return resOk();
	}
	catch (error) {
		return resError(`${error}`);
	}
}

export async function editPassword(
	prevState: string,
	formData: FormData
): Promise<string> {
	let currentPassword = formData.get("password") as string;
	let newPassword = formData.get("new_password") as string;
	let confirmNewPassword = formData.get("confirm_new_password") as string;

	if (newPassword !== confirmNewPassword) {
		return "New Password and Confirm New Password fields do not match!";
	}

	let passwordErr = validatePassword(newPassword);
	if (passwordErr) {
		return passwordErr;
	}

	let jwtPayload;

	try {
		jwtPayload = await getJwtPayload();
		if (jwtPayload == null) {
			throw new Error("Invalid token!");
		}
	} catch (e) {
		console.error(e);
		redirect("/user/login");
	}

	if (!(await checkIfPasswordCorrect(jwtPayload.email, currentPassword))) {
		return "Incorrect Password!";
	}

	let newHash = hashAndSaltPassword(newPassword);

	let res =
		await db`update account set password=${newHash} where email=${jwtPayload.email}`;

	if (res.count === 0) {
		return `Cannot find user with email ${jwtPayload.email}`;
	}

	return "";
}

const addFundsSchema = z.object({
	amountInDollars: z.coerce.number().min(0.01),
	transactionType: z.literal("cash").or(z.literal("gift")),
	sendEmail: z.coerce.boolean(),
	accountEmail: z.string()
});
export async function addFunds(prevState: any, formData: FormData): Promise<APIData<WalletTransaction>> {
	const parsedForm = addFundsSchema.safeParse({
		amountInDollars: formData.get("amount-in-dollars"),
		transactionType: formData.get("transaction-type"),
		accountEmail: formData.get("account-email"),
		sendEmail: formData.get("send-email")
	});
	if (!parsedForm.success) return resError(parsedForm.error.toString());
	
	let permission = (await getJwtPayload())?.permission;
	if (permission == AccountPermission.User)
	{
		return resError("You do not have permission.");
	}

	// The account receiving the funding.
	const fundingAccount = await AccountServe.queryByEmail(parsedForm.data.accountEmail);
	if (fundingAccount == undefined)
	{
		return resError("That account does not exist!");
	}

	try
	{
		let transaction: Omit<WalletTransaction, "id"> = {
			accountEmail: parsedForm.data.accountEmail,
			amountInCents: parsedForm.data.amountInDollars * 100,
			feesInCents: 0,
			customerPaidInCents: parsedForm.data.transactionType == "gift" ? 0 : parsedForm.data.amountInDollars * 100,
			paymentMethod: parsedForm.data.transactionType as WalletTransactionPaymentMethod,
			paymentStatus: WalletTransactionStatus.Paid,
			paidAt: new Date()
		};

		(transaction as WalletTransaction).id = await AccountServe.insertTransaction(transaction);

		if (parsedForm.data.sendEmail && transaction.paymentStatus == WalletTransactionStatus.Paid)
		{
			sendEmail(parsedForm.data.accountEmail, "Thank you for your Purchase", await fundsAdded(transaction as WalletTransaction));
		}

		return resOkData(transaction as WalletTransaction);
	}
	catch (ex)
	{
		console.error(ex);
		return resError("Failed to add Funds!");
	}
}