"use client";

import { resendVerificationLink } from "@/app/api/server-actions/account";
import ActionResponse, {
	ActionResponsePayload
} from "@/app/api/server-actions/ActionResponse";
import { AccountContext } from "@/app/ContextProviders";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { RegularEnvelope } from "lineicons-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useContext, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Alert } from "@mui/material";
import AMSIcon from "@/app/components/AMSIcon";

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

export default function Page() {
	let [data, formAction] = useFormState<
		ActionResponsePayload<{ sentAt: Date; validUntil: Date }>,
		FormData
	>(
		resendVerificationLink,
		ActionResponse.Incomplete<{ sentAt: Date; validUntil: Date }>()
	);

	const accountScope = useContext(AccountContext);

	if (!accountScope.isSingedIn) {
		redirect("/not-found");
	}

	return (
		<HorizontalWrap className="py-8">
			<div className="mx-auto w-fit">
				{/* <AMSIcon /> */}
				<h1 className="text-2xl mt-8">Validate PNW Email</h1>
				<p className="mt-4">
					You must confirm your student or faculty email at PNW to use
					this service.
				</p>

				<form action={formAction} className="mt-6">
					{data?.isComplete ? (
						<button
							disabled={true}
							className="w-fit mb-0 bg-pnw-gold">
							Delivered
						</button>
					) : (
						<EmailSubmitButton />
					)}
					{data?.isComplete && data.errorMessage && (
						<>
							<p className="text-red-500 mt-2">
								An issue occurred. If this continues, email
								support.
							</p>
						</>
					)}
					{data?.isComplete && data.errorMessage == undefined && (
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
			</div>
		</HorizontalWrap>
	);
}
