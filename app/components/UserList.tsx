"use client";

import { changePermission } from "@/app/api/server-actions/account";
import { ChangeEvent, useState, useTransition } from "react";
import DropdownSection from "./DropdownSection";
import Table from "./Table";
import Account, { AccountPermission } from "../Types/Account/Account";

function UserRow({
	user,
	onChange
}: {
	user: Account;
	onChange: (
		email: string,
		oldPermission: string,
		newPermission: string
	) => void;
}): JSX.Element {
	let change = (e: ChangeEvent<HTMLSelectElement>) => {
		onChange(user.email, user.permission, e.target.value);
	};

	return (
		<tr className="">
			<td className="">{user.email}</td>
			<td className="">{user.firstName}</td>
			<td className="">{user.lastName}</td>
			<td>{user.yearOfStudy}</td>
			<td className="">
				<div className="bg-transparent rounded-sm w-full">
					<input type="hidden" name="user-email" value={user.email} />
					<select
						name="permission-admin"
						defaultValue={user.permission}
						onChange={change}
						className="rounded-md m-0 p-1 inline-block text-black bg-transparent border-gray-700 border">
						<option value="admin">Administrator</option>
						<option value="maintainer">Maintainer</option>
						<option value="user">Normal User</option>
					</select>
				</div>
			</td>
		</tr>
	);
}

export function UserList({
	users,
	onChange
}: {
	users: Account[];
	onChange: (
		email: string,
		oldPermission: string,
		newPermission: string
	) => void;
}): JSX.Element {
	return (
		<Table className="bg-white m-auto">
			<thead>
				<tr className="text-gray-400">
					<th className="text-left">Email</th>
					<th className="text-left">First Name</th>
					<th className="text-left">Last Name</th>
					<th className="text-left">Year of Study</th>
					<th className="text-left">Manage User</th>
				</tr>
			</thead>
			<tbody>
				{users.map((e) => (
					<UserRow key={e.email} user={e} onChange={onChange} />
				))}
			</tbody>
		</Table>
	);
}

//using client component reduces the size of each request to the server.
//instead of sending and grabbing the entire new list of users each server call,
//only send data about the one user being changed and update the UI client-side.
export function ListOfUserList({
	normUsers,
	maintainers,
	admins
}: {
	normUsers: Account[];
	maintainers: Account[];
	admins: Account[];
}) {
	//use these states to keep track of when uses are moved into different arrays when their permission changes
	let [userArray, setUserArray] = useState(normUsers);
	let [adminArray, setAdminArray] = useState(admins);
	let [maintainArray, setMaintainArray] = useState(maintainers);

	let [isPending, startTransition] = useTransition();

	//callback will be sent to UserRow component in the <select> element
	//and will be called each time the <select> element is changed
	let onChange = function (
		email: string,
		oldPermission: string,
		newPermission: string
	) {
		if (oldPermission === newPermission) {
			return;
		}

		//must use in order to use Server Action
		startTransition(async () => {
			let formData = new FormData();
			formData.append("new-permission", newPermission);
			formData.append("user-email", email);
			//server action call
			let errorMessage = await changePermission("", formData);

			//handle error message from changePermission here
			if (errorMessage) {
				return;
			}

			let user: Account;

			//filter out user from correct array and update the state
			switch (oldPermission as AccountPermission) {
				case AccountPermission.User:
					user = userArray.find((u) => u.email == email)!;
					setUserArray(userArray.filter((u) => u.email != email));
					break;
				case AccountPermission.Maintainer:
					user = maintainArray.find((u) => u.email == email)!;
					setMaintainArray(
						maintainArray.filter((u) => u.email != email)
					);
					break;
				case AccountPermission.Admin:
					user = adminArray.find((u) => u.email == email)!;
					setAdminArray(adminArray.filter((u) => u.email != email));
					break;
				default:
					return;
			}

			// user.permission = newPermission; //update permission on client

			//add user to list matching their new permission
			//note that React will only update state if creating a new array and not when mutating an array
			switch (newPermission as AccountPermission) {
				case AccountPermission.User:
					setUserArray([...userArray, user]);
					break;
				case AccountPermission.Maintainer:
					setMaintainArray([...maintainArray, user]);
					break;
				case AccountPermission.Admin:
					setAdminArray([...adminArray, user]);
					break;
				default:
					return;
			}
		});
	};

	return (
		<>
			<DropdownSection name={`Administrators (${adminArray.length})`}>
				<UserList users={adminArray} onChange={onChange} />
			</DropdownSection>

			<DropdownSection
				name={`Maintainers (${maintainArray.length})`}
				className="mt-8">
				<UserList users={maintainArray} onChange={onChange} />
			</DropdownSection>

			<DropdownSection
				name={`Users (${normUsers.length})`}
				hidden={true}
				className="mt-8">
				<UserList users={normUsers} onChange={onChange} />
			</DropdownSection>
		</>
	);
}
