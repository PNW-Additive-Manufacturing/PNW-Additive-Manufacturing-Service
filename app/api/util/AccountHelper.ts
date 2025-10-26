import db from "@/app/api/Database";
import { makeJwt } from "@/app/api/util/JwtHelper";
import {
	correctPassword,
	hashAndSaltPassword
} from "@/app/api/util/PasswordHelper";
import getConfig from "@/app/getConfig";
import Account, { AccountPermission, AccountSchema } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import { queryInCompleteReregistration, recordAccountInRegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { addMinutes } from "@/app/utils/TimeUtils";
import * as crypto from "crypto";
import DOMPurify from "isomorphic-dompurify";
import { cookies } from "next/headers";
import postgres, { PostgresError } from "postgres";

const appConfig = getConfig();

export async function createAccount(
	email: string,
	firstName: string,
	lastName: string,
	password: string,
	permission: AccountPermission,
	yearOfStudy: string,
	department: string
) {
	const newAccount = AccountSchema.parse({
		email: email.trim(),
		permission,
		firstName: DOMPurify.sanitize(firstName.trim()),
		lastName: DOMPurify.sanitize(lastName.trim()),
		balanceInCents: 0,
		balanceInDollars: 0,
		isBanned: false,
		isEmailVerified: false,
		joinedAt: new Date(),
		department,
		yearOfStudy
	});

	// TODO: Improve this LOGIC!
	if (!newAccount.email.endsWith("@pnw.edu")) {
		throw new Error("Please enter your full pnw.edu email!");
	}

	let passwordError = validatePassword(password);
	if (passwordError) {
		throw new Error(passwordError);
	}

	let hash = hashAndSaltPassword(password);

	let res: postgres.RowList<postgres.Row[]>;
	try {
		res = await db.begin(async (db) => {
			const accountRow =
				await db`insert into account (email, firstname, lastname, password, permission, JoinedAt)
      				values (${newAccount.email}, ${newAccount.firstName}, ${newAccount.lastName}, ${hash}, ${yearOfStudy}, ${department}, ${newAccount.permission}, ${newAccount.joinedAt})`;

			const verificationCode = crypto.randomBytes(16).toString("hex");
			await db`insert into accountverificationcode (accountemail, code) VALUES (${email}, ${verificationCode})`;

			return accountRow;
		});
	} catch (e: any) {
		//Postgres error code for duplicate entry is 23505 (user already exists)
		if ((e as PostgresError).code == "23505") {
			throw new Error("This email has already been registered");
		}

		console.error(e);
		//throw user friendly error to client
		throw new Error("Failed to add new user!");
	}

	if (res.count === 0) {
		throw new Error("Failed to add new user!");
	}

	try
	{
		// Attempt to register them to any "Reregistration periods/span".
		// This enhances UX as the website won't immediately ask them to provide the same information.
		const reregistrationTodo = await queryInCompleteReregistration(new Date(), email);

		if (reregistrationTodo)
		{
			await recordAccountInRegistrationSpan(reregistrationTodo.id, email, yearOfStudy, department);
		}
	}
	catch (ex)
	{
		console.error(`Failed to reregister new account ${email}`, ex);
	}

	return await login(newAccount);
}

export function validatePassword(password: string) {
	if (password.length < 8) {
		return "Password must be at least 8 characters!";
	}

	if (password.length > 72) {
		return "Password too long!";
	}

	return null;
}

export async function attemptLogin(email: string, password: string) {

	email = email.trim();

	let hashedPassword = await AccountServe.queryPassword(email);

	if (hashedPassword === null) throw new Error("We could not log you in. Please check your email and password and try again.");

	/* Because bcrypt ALWAYS uses 60 character long hashes and 
	   our database schema forces all password hashes to be 64 characters (padding with spaces if necessary),
	   I need to only take the first 60 characters of the hash from the database
	   to ensure that correct passwords will be accepted by the bcrypt compareSync function.
	*/
	hashedPassword = hashedPassword.substring(0, 60);

	let isCorrect = correctPassword(password, hashedPassword);

	if (!isCorrect) throw new Error("We could not log you in. Please check your email and password and try again.");

	const account = await AccountServe.queryByEmail(email);
	
	if (account == null) throw new Error("We could not log you in. Please check your email and password and try again.");

	return await login(account);
}

export async function checkIfPasswordCorrect(
	email: string,
	plaintextPassword: string
) {
	let res: postgres.RowList<postgres.Row[]>;
	try {
		res = await db`select password from account where email=${email}`;
	} catch (e) {
		console.error(e);
		throw new Error("Error: Failed to access database!");
	}

	if (res.count === 0) {
		throw new Error(`No user exists with email ${email}!`);
	}

	let hash = res[0].password as string;

	/* Because bcrypt ALWAYS uses 60 character long hashes and 
	   our database schema forces all password hashes to be 64 characters (padding with spaces if necessary),
	   I need to only take the first 60 characters of the hash from the database
	   to ensure that correct passwords will be accepted by the bcrypt compareSync function.
	*/
	hash = hash.substring(0, 60);

	return correctPassword(plaintextPassword, hash);
}

export async function login(account: Account, expireDate?: Date) {

	let token = await makeJwt(account, expireDate);

	return token;
}

export async function setSessionTokenCookie(token: string)
{
	//session cookie cannot be accessed via client-side javascript, making this safer than
	//just returning the token via JSON response.
	(await cookies()).set(appConfig.sessionCookie, token, {
		httpOnly: true, //cannot be accessed via client-side Javascript
		sameSite: "lax", //can only be sent to same website
		expires: addMinutes(new Date(), 10080),
	});
}