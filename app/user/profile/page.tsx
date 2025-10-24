import { getJwtPayload } from "@/app/api/util/JwtHelper";
import EditPage from "./MainPage";
import HorizontalWrap from "@/app/components/HorizontalWrap";

import AccountServe from "@/app/Types/Account/AccountServe";
import Image from "next/image";
import Link from "next/link";
import { ChangePasswordForm } from "./ChangePasswordForm";
import Profile from "./Profile";

export default async function Page() {
	let jwtPayload = await getJwtPayload();

	const account = (await AccountServe.queryByEmail(jwtPayload.email))!;
	const transactions = await AccountServe.queryTransactionsFor(account.email);

	return <>

		<Profile account={account} transactions={transactions} />

	</>
}
