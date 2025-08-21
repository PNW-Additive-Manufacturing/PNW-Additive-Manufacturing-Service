import { authenticator } from "otplib";
import { WalletTransaction } from "./Wallet";

export enum AccountPermission {
	User = "user",
	Maintainer = "maintainer",
	Admin = "admin"
}

export const YearsOfStudy = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Faculty", "Professor"] as const;
export const Departments = ["Engineering and Sciences", "Technology", "Business", "Nursing", "Humanities, Education or Social Sciences"];

export type AccountWithTransactions = Account & { transactions: WalletTransaction[] }
export type AccountWithPassword = Account & { hashedPassword: string };
export type AccountWithTwoStepAuthentication = Account & {
	twoStepAuthSecret?: string;
};

export interface AccountEmailVerification {
	accountEmail: string;
	createdAt: Date;
	code: string;
}

export default interface Account {
	email: string;
	firstName: string;
	lastName: string;
	joinedAt: Date;
	permission: AccountPermission;
	isEmailVerified: boolean;
	balanceInDollars: number;
	isTwoStepAuthVerified: boolean;
	yearOfStudy: string;
	department?: string;
	isBanned: boolean;
}

export function shortenedName(account: Account) {
	return `${account.firstName} ${account.lastName.at(0)}`;
}

export function formatEmailWithoutDomain(accountEmail: string) {
	return accountEmail.substring(0, accountEmail.indexOf("@"));
}

export const emailVerificationExpirationDurationInDays = 1;
export function IsVerificationCodeExpired(
	verification: AccountEmailVerification
): boolean {
	const expirationDate = new Date(
		verification.createdAt.getTime() +
		emailVerificationExpirationDurationInDays * 86400000
	);

	return Date.now() > expirationDate.getTime();
}

export function hasTwoStepAuthentication(
	account: AccountWithTwoStepAuthentication | Account
): boolean {
	return (
		(account as AccountWithTwoStepAuthentication).twoStepAuthSecret !=
		undefined
	);
}

// export function checkTwoStepAuthentication(
// 	account: AccountWithTwoStepAuthentication,
// 	token: string
// ): boolean {
// 	if (!hasTwoStepAuthentication(account)) {
// 		throw new Error("2-Factor Authentication has not been setup!");
// 	}
// 	return authenticator.check(token, account.twoStepAuthSecret!);
// }
