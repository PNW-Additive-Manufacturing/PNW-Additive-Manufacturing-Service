"use client";

import { editPassword } from "@/app/api/server-actions/account";
import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { useState } from "react";

export function ChangePasswordForm({
	successCallback,
	errCallback,
	className
}: {
	className?: string;
	successCallback?: () => void;
	errCallback?: () => void;
}) {
	let [currentPassword, setCurrentPassword] = useState("");
	let [newPassword, setNewPassword] = useState("");
	let [confirmNewPassword, setConfirmNewPassword] = useState("");

	let action = async (prevState: string, formData: FormData) => {
		let errMessage = await editPassword(prevState, formData);
		if (errMessage) {
			if (errCallback != undefined) {
				errCallback();
			}
			return errMessage;
		}

		setCurrentPassword("");
		setNewPassword("");
		setConfirmNewPassword("");

		if (successCallback != undefined) {
			successCallback();
		}

		return "";
	};

	return (
		<GenericFormServerAction
			className={className}
			serverAction={action}
			submitName="Edit Password"
			submitPendingName="Changing Account Info">
			{/*each input must have a "value" for the state and an onChange event to set the State each time the input is modified*/}
			<Input
				label="Current Password"
				type="password"
				id="password"
				name="password"
				placeholder="Current Password"
				onChange={(e) => setCurrentPassword(e.currentTarget.value)}
				value={currentPassword}
			/>
			<div className="flex gap-6">
				<Input
					label="New Password"
					type="password"
					id="new_password"
					name="new_password"
					placeholder="New Password"
					onChange={(e) => setNewPassword(e.currentTarget.value)}
					value={newPassword}
				/>
				<Input
					label="Confirm New Password"
					type="password"
					id="confirm_new_password"
					name="confirm_new_password"
					placeholder="Confirm New Password"
					onChange={(e) =>
						setConfirmNewPassword(e.currentTarget.value)
					}
					value={confirmNewPassword}
				/>
			</div>
		</GenericFormServerAction>
	);
}
