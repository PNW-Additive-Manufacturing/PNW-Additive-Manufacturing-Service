import HorizontalWrap from "@/app/components/HorizontalWrap";
import { AccountPermission } from "@/app/Types/Account/Account";
import AccountServe from "@/app/Types/Account/AccountServe";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import { Suspense } from "react";
import AccountManager from "./AccountManager";

export default async function Page() {

	return (
		<>
			<HorizontalWrap className="py-8">

				<h1 className="text-2xl tracking-wide font-light mb-6">
					Accounts
				</h1>

				<Suspense>

					<Dynamic />

				</Suspense>

			</HorizontalWrap>
		</>
	);
}

async function Dynamic() {
	
	// Auth Check
	await serveRequiredSession({ requiredPermission: AccountPermission.Maintainer });

	const allUsers = await AccountServe.queryAllWithTransactions();

	return <AccountManager accounts={allUsers} />
}