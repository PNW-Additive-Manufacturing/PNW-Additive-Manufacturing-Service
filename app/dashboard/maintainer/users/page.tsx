import { UserList, ListOfUserList } from "@/app/components/UserList";
import AccountServe from "@/app/Types/Account/AccountServe";
import { AccountPermission } from "@/app/Types/Account/Account";

export default async function Admin() {
	const allUsers = await AccountServe.queryAll();

	return (
		<>
			<ListOfUserList
				admins={allUsers.filter(u => u.permission == AccountPermission.Admin)}
				maintainers={allUsers.filter(u => u.permission == AccountPermission.Maintainer)}
				normUsers={allUsers.filter(u => u.permission == AccountPermission.User)}
			/>
		</>
	);
}
