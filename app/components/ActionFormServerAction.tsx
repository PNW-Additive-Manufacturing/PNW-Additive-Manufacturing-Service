"use client";

import { useFormState, useFormStatus } from "react-dom";
import ActionResponse, {
	ActionResponsePayload
} from "../api/server-actions/ActionResponse";

function SubmitButton({
	className,
	name,
	pendingName,
	disabled
}: {
	className?: string;
	name: string;
	pendingName?: string;
	disabled: boolean;
}) {
	let { pending } = useFormStatus();
	return (
		<input
			className="font-light"
			disabled={disabled}
			type="submit"
			value={pending ? (pendingName ? pendingName : name) : name}
		/>
	);
}

//TODO: Make this work for more generic forms
export default function ActionFormServerAction<T>({
	className,
	submitButtonClassName,
	serverAction,
	submitName,
	submitPendingName,
	disabled,
	children
}: {
	className?: string;
	submitButtonClassName?: string;
	serverAction: (
		state: ActionResponsePayload<T>,
		formData: FormData
	) => Promise<ActionResponsePayload<T>>;
	submitName: string;
	submitPendingName?: string;
	clearOnSuccess?: boolean;
	disabled?: boolean;
	children: any;
}): JSX.Element {
	let [prevState, formAction] = useFormState<
		ActionResponsePayload<T>,
		FormData
	>(serverAction, ActionResponse.Incomplete<T>());

	disabled = disabled ?? false;

	return (
		<form className="" action={formAction}>
			{children}

			{/* <p className="text-sm text-red-500">{error}</p> */}
			<SubmitButton
				disabled={disabled}
				className={submitButtonClassName}
				name={submitName}
				pendingName={submitPendingName}
			/>

			{prevState.errorMessage == undefined ? (
				<></>
			) : (
				<div className="bg-red-400 text-white rounded-md p-4 w-fit">
					{prevState.errorMessage}
				</div>
			)}
		</form>
	);
}
