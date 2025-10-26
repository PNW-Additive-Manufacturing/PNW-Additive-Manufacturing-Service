import z from "zod";
import { WalletTransaction } from "./Wallet";

export enum AccountPermission {
	User = "user",
	Maintainer = "maintainer",
	Admin = "admin"
}

// An unfortunate side-effect of using strings as account permissions.
export function GetAccountPermissionLevel(permission?: AccountPermission | null): number
{
	if (permission === AccountPermission.Admin) return 3;
	if (permission === AccountPermission.Maintainer) return 2;
	if (permission === AccountPermission.User) return 1;
	return 0;
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

export const AccountSchema = z.object({
	email: z.email(),
	firstName: z.string(),
	lastName: z.string(),
	joinedAt: z.coerce.date(),
	permission: z.enum(AccountPermission),
	isEmailVerified: z.boolean(),
	balanceInDollars: z.number(),
	balanceInCents: z.number().int(),
	isBanned: z.boolean(),
	yearOfStudy: z.string().optional(),
	department: z.string().optional()
});

type Account = z.infer<typeof AccountSchema>;

export default Account;

// export default interface Account {
// 	email: string;
// 	firstName: string;
// 	lastName: string;
// 	joinedAt: Date;
// 	permission: AccountPermission;
// 	isEmailVerified: boolean;
// 	balanceInDollars: number;
// 	balanceInCents: number;
// 	yearOfStudy: string;
// 	department?: string;
// 	isBanned: boolean;
// }

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
