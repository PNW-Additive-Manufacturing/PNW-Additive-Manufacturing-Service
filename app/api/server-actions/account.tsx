"use server";

import db from "@/app/api/Database";
import { attemptLogin, checkIfPasswordCorrect, createAccount, login, setSessionTokenCookie, validatePassword } from "@/app/api/util/AccountHelper";
import { serveAdminSession, serveRequiredSession } from "@/app/api/util/SessionHelper";
import getConfig from "@/app/getConfig";
import { AccountPermission, emailVerificationExpirationDurationInDays } from "@/app/Types/Account/Account";
import AccountServe, { makeTransactionPDF } from "@/app/Types/Account/AccountServe";
import { WalletTransaction, WalletTransactionPaymentMethod, WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import { dollarsToCents } from "@/app/utils/MathUtils";
import { addMinutes } from "@/app/utils/TimeUtils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { APIData, resAttemptAsync, resError, resOk, resOkData } from "../APIResponse";
import { fundsAdded, sendEmail, verifyEmailTemplate } from "../util/Mail";
import { hashAndSaltPassword } from "../util/PasswordHelper";
import ActionResponse, { ActionResponsePayload } from "./ActionResponse";

const envConfig = getConfig();

export async function tryLogin(prevState: string, formData: FormData) {
	try {
		const token = await attemptLogin((formData.get("email") as string).toLowerCase(), formData.get("password") as string);

		setSessionTokenCookie(token);

		revalidatePath("/");
	} catch (e: any) {
		//e must be any because Typescript is stupid when it comes to try catch
		return (e as Error).message;
	}

	const wantedRedirect = formData.get("redirect") as string;
	if (wantedRedirect && wantedRedirect.startsWith(envConfig.hostURL)) {
		console.log(`Redirecting to ${wantedRedirect}`);
		redirect(wantedRedirect);
	}

	redirect("/");
}

const createAccountSchema = z.object({
	email: z.string().email().toLowerCase(),
	firstName: z.string(),
	lastName: z.string(),
	password: z.string(),
	yearOfStudy: z.string(),
	department: z.string()
});
export async function tryCreateAccount(prevState: string, formData: FormData) {
	const parsedData = createAccountSchema.safeParse({
		email: formData.get("email"),
		firstName: formData.get("firstname"),
		lastName: formData.get("lastname"),
		password: formData.get("password"),
		yearOfStudy: formData.get("year-of-study"),
		department: formData.get("department")
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
		const token = await createAccount(
			parsedData.data.email,
			parsedData.data.firstName,
			parsedData.data.lastName,
			parsedData.data.password,
			AccountPermission.User,
			parsedData.data.yearOfStudy,
			parsedData.data.department
		);

		setSessionTokenCookie(token);

		revalidatePath("/");
	} catch (e: any) {
		//e must be any because Typescript is stupid when it comes to try catch
		return (e as Error).message;
	}

	//use try-catch in case JWT is invalid
	try {
		const session = await serveRequiredSession();
		redirect("/");
	} catch (error) {
		redirect("/user/login");
	}
}

export async function logout() {
	console.log("Logout");
	cookies().delete(envConfig.sessionCookie);
}

export async function changePermission(formData: FormData): Promise<APIData<{}>> {
	return await resAttemptAsync(async () => {
		// Require admin permission
		const session = await serveAdminSession();

		let newPermission = formData.get("new-permission") as AccountPermission;
		let userEmail = formData.get("user-email") as string;

		let res = await db`update account set permission=${newPermission} where email=${userEmail} returning email`;

		if (res.count == 0) throw new Error("Account does not exist!");

		return resOk();
	});
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
	try {
		const jwtPayload = await serveRequiredSession();
		let fname = formData.get("firstname") as string;
		let lname = formData.get("lastname") as string;

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
	} catch (error) {
		if (error instanceof Error && error.message.includes("Unauthorized")) {
			redirect("/user/login");
		}
		console.error("[EDIT NAME]", error);
		return "An error occurred updating your name";
	}
}

export async function resendVerificationLink(
	prevState: ActionResponse,
	formData: FormData
): Promise<ActionResponsePayload<{ sentAt: Date; validUntil: Date }>> {
	try {
		const JWTPayload = await serveRequiredSession();
		if (JWTPayload.isemailverified) {
			return ActionResponse.Error("Email has already been verified!");
		}

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
	} catch (error) {
		return ActionResponse.Error("Authentication required");
	}
}

export async function sendPasswordResetEmail(
	prevState: ActionResponse,
	formData: FormData
): Promise<APIData<{ validUntil: Date }>> {
	const parsedEmail = z.string().email().safeParse(formData.get("email"));
	if (!parsedEmail.success) return resError(parsedEmail.error.toString());

	try {
		// TODO: Don't throw SQL error when account does not exist.
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
	try {
		const jwtPayload = await serveRequiredSession();
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
	} catch (error) {
		if (error instanceof Error && error.message.includes("Unauthorized")) {
			redirect("/user/login");
		}
		console.error("[EDIT PASSWORD]", error);
		return "An error occurred updating your password";
	}
}

const addFundsSchema = z.object({
	amountInDollars: z.coerce.number().gt(0),
	transactionType: z.enum(["cash", "gift"]),
	sendEmail: z.coerce.boolean(),
	accountEmail: z.string().email(),
});

export async function addFunds(
	prevState: any,
	formData: FormData
): Promise<APIData<{ sentEmail: boolean; transaction: WalletTransaction; }>> {
	// Parse and validate form data
	const parsedForm = addFundsSchema.safeParse({
		amountInDollars: formData.get("amount-in-dollars"),
		transactionType: formData.get("transaction-type"),
		accountEmail: formData.get("account-email"),
		sendEmail: formData.get("send-email"),
	});

	if (!parsedForm.success) return resError(parsedForm.error.toString());

	// Require admin permission
	try {
		const session = await serveAdminSession();
	} catch (error) {
		return resError("You do not have permission.");
	}

	// Verify account exists
	const fundingAccount = await AccountServe.queryByEmail(parsedForm.data.accountEmail);

	if (!fundingAccount) return resError("That account does not exist!");

	const amountInCents = dollarsToCents(parsedForm.data.amountInDollars);

	try {
		// Create transaction
		const transaction: Omit<WalletTransaction, "id"> = {
			accountEmail: parsedForm.data.accountEmail,
			amountInCents,
			feesInCents: 0,
			customerPaidInCents: parsedForm.data.transactionType === "gift" ? 0 : amountInCents,
			paymentMethod: parsedForm.data.transactionType as WalletTransactionPaymentMethod,
			paymentStatus: WalletTransactionStatus.Paid,
			paidAt: new Date(),
		};

		const transactionId = await AccountServe.insertTransaction(transaction);
		const completeTransaction: WalletTransaction = {
			...transaction,
			id: transactionId,
		};

		// Generate PDF receipt
		let transactionPDFStream = null;
		try {

			transactionPDFStream = await makeTransactionPDF(
				completeTransaction,
				fundingAccount
			);

		} catch (ex) {

			console.error("Failed to generate transaction PDF for email receipt:", ex);

		}

		// Send email if requested and conditions are met which for now, will always be the case.
		const shouldSendEmail =
			parsedForm.data.sendEmail &&
			completeTransaction.paymentStatus === WalletTransactionStatus.Paid &&
			completeTransaction.customerPaidInCents > 0;

		if (shouldSendEmail) {
			try {
				await sendEmail(
					parsedForm.data.accountEmail,
					"Thank you for your Deposit",
					await fundsAdded(completeTransaction),
					transactionPDFStream
						? [{ filename: "receipt.pdf", content: transactionPDFStream }]
						: undefined
				);

				return resOkData({
					sentEmail: true,
					transaction: completeTransaction,
				});

			} catch (ex) {

				console.error("Failed to send email:", ex);
				return resOkData({
					sentEmail: false,
					transaction: completeTransaction,
				});

			}
		}

		return resOkData({
			sentEmail: false,
			transaction: completeTransaction,
		});

	} catch (ex) {
		console.error("Failed to add funds:", ex);
		return resError("Failed to add funds!");
	}
}