"use client";

import { resendVerificationLink } from "@/app/api/server-actions/account";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import useAPIFormState from "@/app/hooks/useAPIFormState";
import { useState } from "react";
import { useFormStatus } from "react-dom";

export default function EmailValidation() {

	const { result, formAction, isPending } = useAPIFormState(resendVerificationLink);

	return <>

		<form action={formAction} className="mt-6">
			{result?.success ? (
				<button
					disabled={true}
					className="w-fit mb-0 bg-pnw-gold">
					Delivered
				</button>
			) : (
				<EmailSubmitButton />
			)}
			{!result?.success && result?.errorMessage && (
				<>
					<p className="text-red-500 mt-2">
						{result.errorMessage}
					</p>
				</>
			)}
			{isPending && (
				<>
					<p className="mt-2">
						Please wait, it may take up to 4 minutes for PNW to
						process the email.
					</p>
					<p>
						We recommend using the same device to verify that you are currently using.
					</p>
				</>
			)}
		</form>

	</>
}

function EmailSubmitButton() {
	const status = useFormStatus();
	const [showCompleted, setShowCompleted] = useState(false);

	return (
		<button
			className={`w-fit flex gap-2 m-0 ${showCompleted && "bg-green-600"
				}`}
			disabled={status.pending || showCompleted}>
			<div className="flex gap-1">
				{showCompleted
					? "Sent to Inbox"
					: status.pending
						? "Sending Email"
						: "Send Email"}
			</div>
			{status.pending && <FormLoadingSpinner className="fill-white" />}
		</button>
	);
}