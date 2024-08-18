"use server";
/*
  MUST USE "use server" FOR SERVER ACTIONS.
  Not doing so will result in compilation errors caused from attempting to bundle server
  NPM packages for the client
*/

import {
	attemptLogin,
	checkIfPasswordCorrect,
	createAccount,
	login,
	validatePassword
} from "@/app/api/util/AccountHelper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	getJwtPayload,
	makeJwt,
	retrieveSafeJWTPayload,
	UserJWT
} from "@/app/api/util/JwtHelper";
import { SESSION_COOKIE } from "@/app/api/util/Constants";
import { cookies } from "next/headers";
import * as crypto from "crypto";

import db from "@/app/api/Database";
import { hashAndSaltPassword } from "../util/PasswordHelper";
import {
	AccountPermission,
	emailVerificationExpirationDurationInDays
} from "@/app/Types/Account/Account";
import ActionResponse, { ActionResponsePayload } from "./ActionResponse";
import { number, z } from "zod";
import AccountServe from "@/app/Types/Account/AccountServe";
import { sendEmail, verifyEmailTemplate } from "../util/Mail";
import { WalletTransactionPaymentMethod } from "@/app/Types/Account/Wallet";

/*
  Server Actions for Account-related server stuff
*/

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
	if (permission == AccountPermission.User) {
		redirect(`/dashboard/user`);
	} else {
		redirect(`/dashboard/maintainer`);
	}
}

const createAccountSchema = z.object({
	email: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	password: z.string()
});
export async function tryCreateAccount(prevState: string, formData: FormData) {
	const parsedData = createAccountSchema.safeParse({
		email: formData.get("email"),
		firstName: formData.get("firstname"),
		lastName: formData.get("lastname"),
		password: formData.get("password")
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
			AccountPermission.User
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
	redirect(`/dashboard/${jwtPayload.permission}`);
}

export async function logout() {
	console.log("Logout");
	cookies().delete(SESSION_COOKIE);
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
		res.at(0)!.isemailverified as boolean
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
					`http://localhost:3000/user/verify-email/?token=${verificationEntry.code}`
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
