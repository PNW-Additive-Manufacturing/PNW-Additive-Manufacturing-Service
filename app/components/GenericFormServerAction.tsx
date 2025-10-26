"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({
	className,
	name,
	pendingName
}: {
	className?: string;
	name: string;
	pendingName?: string;
}) {
	let { pending, data } = useFormStatus();
	console.log(data);
	return (
		<div
			className={
				className
					? className
					: "bg-white rounded-sm font-semibold mb-0 w-full"
			}>
			<input
				type="submit"
				value={pending ? (pendingName ? pendingName : name) : name}
			/>
		</div>
	);
}

//TODO: Make this work for more generic forms
export default function GenericFormServerAction({
	className,
	submitButtonClassName,
	serverAction,
	submitName,
	submitPendingName,
	clearOnSuccess,
	children
}: {
	className?: string;
	submitButtonClassName?: string;
	serverAction: (state: string, formData: FormData) => Promise<string>;
	submitName: string;
	submitPendingName?: string;
	clearOnSuccess?: boolean;
	children: any;
}): React.ReactElement {
	let [error, formAction] = useActionState<any, FormData>(serverAction, "");

	return (
		<form
			className={
				className
					? className
					: "p-4 lg:p-6 rounded-sm shadow-sm bg-white out"
			}
			action={formAction}>
			{children}
			<p className="text-sm text-red-500">{error}</p>
			<SubmitButton
				className={submitButtonClassName}
				name={submitName}
				pendingName={submitPendingName}
			/>
		</form>
	);
}
