import AccountServe from "@/app/Types/Account/AccountServe";
import AccountManager from "./AccountManager";
import HorizontalWrap from "@/app/components/HorizontalWrap";

export default async function Admin() {
	const allUsers = await AccountServe.queryAllWithTransactions();

	return (
		<>
			<HorizontalWrap className="py-8">
				<AccountManager accounts={allUsers} />
			</HorizontalWrap>
		</>
	);
}
