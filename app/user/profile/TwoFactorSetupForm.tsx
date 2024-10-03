"use client";

import { AccountContext } from "@/app/ContextProviders";
import FocusOnMount from "@/app/components/FocusOnMount";
import { GenericUnitInput } from "@/app/components/Inputs";
import { hasTwoStepAuthentication } from "@/app/Types/Account/Account";
import Image from "next/image";
import { authenticator } from "otplib";
import { useContext, useRef, useState } from "react";
import QRCode from "react-qr-code";

export default function TwoFactorSetupForm() {
	const account = useContext(AccountContext).account!;

	const [twoAuthSecret, setTwoAuthSecret] = useState<string | undefined>(
		undefined
	);

	const inputVerifyCodeRef = useRef<HTMLInputElement>();

	const verifyCode = (code: string) => {
		if (twoAuthSecret == undefined) return;
		if (authenticator.check(code, twoAuthSecret)) {
			alert("Your account has been verified!");
		} else alert("Invalid code!");
	};

	return (
		<>
			<div className="flex justify-between items-center gap-6">
				<div className="flex items-center gap-4">
					{hasTwoStepAuthentication(account) ? (
						<>Two-step authentication setup!</>
					) : (
						<span>
							<span className="text-red-500 lg:text-xl">ⓘ</span>{" "}
							Two-step authentication has not been setup.
						</span>
					)}
				</div>
				<form>
					{!twoAuthSecret && (
						<button
							className="mb-0"
							disabled={true}
							onClick={() =>
								setTwoAuthSecret("FVHBMKIUCZKQ4I22")
							}>
							Setup
						</button>
					)}
				</form>
			</div>
			{twoAuthSecret && (
				<>
					<hr className="my-4" />
					<div className="lg:flex gap-6 mt-4 items-center">
						<QRCode
							value={`otpauth://totp/Additive%20Manufacturing%20Service?secret=${twoAuthSecret}`}
							className="w-56 h-56 outline outline-2 outline-gray-300 p-2 rounded-sm"
						/>
						<div className="py-2">
							<h2 className="text-xl font-normal">
								Scan QR code in Google Auth and enter given
								code.
							</h2>

							<p className="py-1 px-2 text-sm bg-gray-200 w-fit my-2 rounded-lg">
								Setup key: <span>{twoAuthSecret}</span>
							</p>

							<br />

							<form
								onSubmit={() =>
									verifyCode(
										inputVerifyCodeRef.current!.value
									)
								}>
								<GenericUnitInput
									id="key"
									unit="Code"
									placeHolder="Enter code from Google Auth"></GenericUnitInput>
								<button className="mb-0 px-3 py-3 text-sm">
									Complete
								</button>
							</form>
						</div>
					</div>
				</>
			)}
		</>
	);
}
