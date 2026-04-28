import { serveRequiredSession } from "@/app/api/util/SessionHelper";
import AccountServe from "@/app/Types/Account/AccountServe";
import { redirect } from "next/navigation";
import Profile from "./Profile";

export default async function Page() {
	let jwtPayload;
	try {
		jwtPayload = await serveRequiredSession();
	} catch (error) {
		redirect("/user/login");
	}

	const account = (await AccountServe.queryByEmail(jwtPayload.email))!;
	const transactions = await AccountServe.queryTransactionsFor(account.email);

	return <>

		<Profile account={account} transactions={transactions} />

	</>
}
