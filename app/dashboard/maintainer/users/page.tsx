import AccountServe from "@/app/Types/Account/AccountServe";
import AccountManager from "./AccountManager";

export default async function Admin() {
	const allUsers = await AccountServe.queryAllWithTransactions();

	return (
		<>
			<AccountManager accounts={allUsers}></AccountManager>
		</>
	);
}
