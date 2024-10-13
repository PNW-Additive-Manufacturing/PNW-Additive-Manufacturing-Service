"use client";

import HorizontalWrap from "@/app/components/HorizontalWrap";
import Account from "@/app/Types/Account/Account";
import Link from "next/link";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useState } from "react";

export default function Profile({ account }: { account: Account }) {
	const [showPasswordReset, setShowPasswordReset] = useState(false);

	return (
		<HorizontalWrap>
			<h1 className="text-3xl tracking-wide font-light">Your Account</h1>
			<br />
			<div className="p-6 rounded-md text-base bg-cool-black shadow-md">
				<div className="lg:flex justify-between items-center">
					<div>
						<p className="text-3xl font-light text-white">
							{account.firstName} {account.lastName}
						</p>
						<p className="text-sm text-gray-300">
							Member since{" "}
							{account.joinedAt.toLocaleDateString("en-us", {
								weekday: "long",
								month: "short",
								day: "numeric"
							})} as a {account.yearOfStudy}
						</p>
					</div>
					<div className="hidden lg:block">
						<Link href="/user/wallet">
							<div className="text-2xl text-right text-white">
								<p className="text-sm text-gray-300">
									Manage Wallet
								</p>
								<div></div>$
								{account.balanceInDollars.toFixed(2)}
							</div>
						</Link>
					</div>
				</div>
			</div>

			<div className="px-4">
				<div className="lg:hidden">
					<div className="flex justify-between gap-10 py-6">
						<Link
							href="/user/wallet"
							className="font-semibold lg:w-52">
							Wallet
						</Link>
						<p>
							Available balance: $
							{account.balanceInDollars.toFixed(2)}
						</p>
					</div>
				</div>

				<br />
				<div className="flex gap-10 py-2">
					Contact Information
					<div>
					<p>{account.firstName} {account.lastName}</p>
					<p>{account.email} ({account.isEmailVerified ? <>Verified</> : <span className="font-semibold">Unverified</span>})</p>
					</div>
				</div>

				<div className="py-2">
					<div className="flex gap-10 items-center">
						<p>Manage Password</p>
						<button
							className="w-fit text-sm mb-0 px-3 py-1.5"
							onClick={() => setShowPasswordReset(true)}>
							Modify
						</button>
					</div>
					{showPasswordReset && (
						<ChangePasswordForm className="px-0 bg-transparent" />
					)}
				</div>

				<div className="py-2 mt-4">
					<a
						className="text-red-500 font-bold w-fit"
						href="/user/logout">
						Sign out of Account
					</a>
				</div>
			</div>
		</HorizontalWrap>
	);
}
