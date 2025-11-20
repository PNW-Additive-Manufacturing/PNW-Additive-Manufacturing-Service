import HorizontalWrap from "@/app/components/HorizontalWrap";
import AccountServe from "@/app/Types/Account/AccountServe";
import AccountManager from "./AccountManager";

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
