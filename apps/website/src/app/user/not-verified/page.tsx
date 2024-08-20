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

function EmailSubmitButton({ email }: { email: string }) {
	const status = useFormStatus();
	const [prevPending, setPrevPending] = useState(status.pending);
	const [showCompleted, setShowCompleted] = useState(false);

	// Hacky way to determine if an action has been "completed" not just succeeded.
	// if (status.pending != prevPending && prevPending == true)
	// 	setShowCompleted(true);
	if (prevPending != status.pending) setPrevPending(status.pending);

	return (
		<button
			className={`w-full flex gap-2 m-0 text-base text-left ${
				showCompleted && "bg-green-600"
			}`}
			disabled={status.pending || showCompleted}>
			<div className="flex gap-1">
				{showCompleted ? "Sent to Inbox" : `Send Verification to`}
				<div className="first-letter:uppercase">{email}</div>
			</div>
			{status.pending && (
				<FormLoadingSpinner className="mr-2 fill-white" />
			)}
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
		<HorizontalWrap>
			<div className="w-full lg:mx-auto lg:w-fit">
				<h1 className="text-3xl font-light mt-8">Validate PNW Email</h1>
				<h2 className="text-base font-normal text-gray-700 mt-4">
					You must confirm your student or faculty email at PNW to use
					this service.
				</h2>
				<h3 className="text-base font-normal text-gray-700">
					Email{" "}
					<a className="underline" href="mailto:support@pnw3d.com">
						support@pnw3d.com
					</a>{" "}
					for support if required.
				</h3>
				<form action={formAction} className="mt-8">
					<EmailSubmitButton email={accountScope.account!.email} />
					{data.isComplete && data.errorMessage && (
						<>
							<p className="text-red-500 mt-2">
								An issue occurred. If this continues, email
								support.
							</p>
						</>
					)}
					{data.isComplete && data.errorMessage == undefined && (
						<>
							<p>
								Validation email is valid until{" "}
								{data.data!.validUntil.toLocaleDateString(
									"en-us",
									{
										weekday: "long",
										hour: "2-digit"
									}
								)}
								. Please allow up to 5 minutes for an email.
							</p>
						</>
					)}
				</form>
			</div>
		</HorizontalWrap>
	);
}
