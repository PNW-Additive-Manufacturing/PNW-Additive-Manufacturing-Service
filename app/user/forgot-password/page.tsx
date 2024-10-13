"use client";

import { Input } from "@/app/components/Input";
import { sendPasswordResetEmail, tryLogin } from "@/app/api/server-actions/account";
import { useFormState, useFormStatus } from "react-dom";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import AMSIcon from "@/app/components/AMSIcon";
import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import FormSubmitButton from "@/app/components/FormSubmitButton";

export default function ForgotPassword() {
	//note that Server component cannot return null or Class objects, only plain JSONs and primitive types
	let [res, formAction] = useFormState<ReturnType<typeof sendPasswordResetEmail>, FormData>(sendPasswordResetEmail, null!);

	return (
		<HorizontalWrap>
			<div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
				<div className="lg:mx-auto mb-4 w-fit">
					<AMSIcon />
				</div>
				<h1 className="text-xl text-center font-normal">
					Reset password via Email
				</h1>
				<br />
				<div className="py-2 w-full">
					<form action={formAction}>
						<Input
							label="Purdue Northwest Email"
							type="text"
							id="email"
							name="email"
							required={true}
							placeholder="Enter your PNW Email"
						/>
						<FormSubmitButton label="Reset Password" />
						{res && (!res.success
							? <p className="text-red-600">
								{res.errorMessage}
							</p>
							: <p className="text-sm">
								An email has been sent to you with details on how to reset your password and will expire at <span className="font-semibold">{formateDateWithTime(res.validUntil)}</span>. It may take up to 4 minutes for PNW to
								process the email.
							</p>)
						}
					</form>
				</div>
			</div>
		</HorizontalWrap>
	);
}
