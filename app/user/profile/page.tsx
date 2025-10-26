
import AccountServe from "@/app/Types/Account/AccountServe";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import Profile from "./Profile";

export default async function Page() {

	const session = await serveRequiredSession();

	const account = (await AccountServe.queryByEmail(session.account.email))!;
	const transactions = await AccountServe.queryTransactionsFor(account.email);

	return <>

		<Profile account={account} transactions={transactions} />

	</>
}
