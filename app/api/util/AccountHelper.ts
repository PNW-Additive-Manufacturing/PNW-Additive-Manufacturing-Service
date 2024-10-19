import { cookies } from "next/headers";
import {
	correctPassword,
	hashAndSaltPassword
} from "@/app/api/util/PasswordHelper";
import postgres, { PostgresError } from "postgres";
import db from "@/app/api/Database";
import { makeJwt } from "@/app/api/util/JwtHelper";
import * as crypto from "crypto";
import { AccountPermission } from "@/app/Types/Account/Account";
import DOMPurify from "isomorphic-dompurify";
import getConfig from "@/app/getConfig";

const appConfig = getConfig();

export async function createAccount(
	email: string,
	firstName: string,
	lastName: string,
	password: string,
	permission: AccountPermission,
	yearOfStudy: string
) {
	firstName = DOMPurify.sanitize(firstName.trim());
	lastName = DOMPurify.sanitize(lastName.trim());
	email = email.trim();

	// TODO: Improve this LOGIC!
	if (!email.endsWith("@pnw.edu")) {
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
				await db`insert into account (email, firstname, lastname, password, yearOfStudy, permission)
      			values (${email}, ${firstName}, ${lastName}, ${hash}, ${yearOfStudy}, ${permission})`;

			const verificationCode = crypto.randomBytes(16).toString("hex");
			await db`insert into accountverificationcode (accountemail, code) VALUES (${email}, ${verificationCode})`;

			return accountRow;
		});
	} catch (e: any) {
		//Postgres error code for duplicate entry is 23505 (user already exists)
		if ((e as PostgresError).code == "23505") {
			throw new Error(`Email is already being used!`);
		}

		console.error(e);
		//throw user friendly error to client
		throw new Error("Failed to add new user!");
	}

	if (res.count === 0) {
		throw new Error("Failed to add new user!");
	}

	await login(
		email,
		permission as AccountPermission,
		firstName,
		lastName,
		false
	);
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

	let res: postgres.RowList<postgres.Row[]>;
	try {
		res =
			await db`select password, permission, firstname, lastname, isemailverified from account where email=${email}`;
	} catch (e) {
		console.error(e);
		throw new Error("Error: Failed to access database!");
	}

	if (res.count === 0) {
		throw new Error("We couldn't log you in. Please check your email and password and try again.");
	}

	let hash = res[0].password as string;
	let permission = res[0].permission as AccountPermission;
	let firstname = res[0].firstname as string;
	let lastname = res[0].lastname as string;
	let isemailverified = res[0].isemailverified as boolean;

	/* Because bcrypt ALWAYS uses 60 character long hashes and 
	   our database schema forces all password hashes to be 64 characters (padding with spaces if necessary),
	   I need to only take the first 60 characters of the hash from the database
	   to ensure that correct passwords will be accepted by the bcrypt compareSync function.
	*/
	hash = hash.substring(0, 60);

	let passwordCorrect = correctPassword(password, hash);

	if (!passwordCorrect) {
		throw new Error("We couldn't log you in. Please check your email and password and try again.");
	}

	await login(email, permission, firstname, lastname, isemailverified);
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

export async function login(
	email: string,
	permission: AccountPermission,
	firstname: string,
	lastname: string,
	isemailverified: boolean,
	expireDate?: Date
) {
	let token = await makeJwt(
		email,
		permission,
		firstname,
		lastname,
		isemailverified,
		expireDate
	);

	//session cookie cannot be accessed via client-side javascript, making this safer than
	//just returning the token via JSON response.
	cookies().set(appConfig.sessionCookie, token, {
		httpOnly: true, //cannot be accessed via client-side Javascript
		sameSite: "lax", //can only be sent to same website
		secure: false //TODO: set to true once we have HTTPS connection
	});
	return token;
}
