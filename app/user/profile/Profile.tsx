"use client";

import HorizontalWrap from "@/app/components/HorizontalWrap";
import Account from "@/app/Types/Account/Account";
import Link from "next/link";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { Suspense, useState } from "react";
import DropdownSection from "@/app/components/DropdownSection";
import { WalletTransaction } from "@/app/Types/Account/Wallet";
import TransactionDetails from "../../components/TransactionDetails";
import { RegularCheckmark, RegularWarning } from "lineicons-react";
import { formateDate } from "@/app/api/util/Constants";

export default function Profile({ account, transactions }: { account: Account, transactions: WalletTransaction[] }) {
	return (
		<>
			<HorizontalWrap className="py-8">
				<h1 className="text-2xl tracking-wide font-light mb-2">Welcome, {account.firstName} {account.lastName}!</h1>
				<hr />
				<div className="grid gap-y-6 lg:grid-cols-2">
					<div>
						<h3 className="mb-0.5">Contact Information</h3>
						<p>{account.firstName} {account.lastName}</p>
						<p>
							<span>{account.email}</span>
							<span className="ml-2 text-xs">{account.isEmailVerified ? <span className="text-pnw-gold bg-pnw-gold-light py-0.5 px-2 rounded-lg"><RegularCheckmark className="inline fill-pnw-gold mb-0.5 mr-2" />Verified</span> : <span className="bg-red-100 py-0.5 px-2 rounded-lg text-red-400"><RegularWarning className="inline fill-red-400 mr-2 mb-0.5"></RegularWarning>Unverified</span>}</span>
						</p>
					</div>
					<div>
						<h3 className="mb-0.5">Registration Details</h3>
						<p>Registered on {formateDate(account.joinedAt)}</p>
						<p>Joined as {account.yearOfStudy}</p>
					</div>
				</div>
				<br />
				<a
					className="text-sm hover:text-red-500"
					href="/user/logout">
					Sign out of Account
				</a>

			</HorizontalWrap>
			<div className="bg-white min-h-screen py-8">
				<HorizontalWrap>
					<div>
						<h2 id="wallet" className="w-fit text-xl font-normal mb-1">Wallet</h2>
						<p>Wallet is a prepaid balance exclusively for ordering parts within our platform to reduce the cost of 3D Printing.</p>
						<br />
						<div className="mb-4 p-6 rounded-md text-base text-white bg-cool-black shadow-md">
							<p className="text-white text-xl font-light">
								Balance ${account.balanceInDollars.toFixed(2)}
							</p>
						</div>

						<div className="out bg-white p-6">
							<span className="font-semibold">We only accept in-person transactions! </span>
							To deposit funds into your account, please visit the <a className="underline" href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
								PNW Design Studio
							</a> during our operating hours and speak with an officer of the Additive Manufacturing club.
							<ul className="mt-2">
								<li>If you are part of a design team or club, you can request reimbursement through a Student Services Fee (SSF) request (or COOL) using the receipt we provide.</li>
							</ul>
						</div>

						<br />

						<DropdownSection className="px-0" name={"Purchase History"}>
							<div className="">
								{transactions.length == 0 ? (
									<div className="outline outline-1 outline-gray-300 px-4 py-6 bg-white rounded-md">
										You have not made any transactions.
									</div>
								) : (
									<div className="flex flex-col gap-2">
										{transactions.map((value) => (
											<TransactionDetails transaction={Object.assign(value, account)}></TransactionDetails>
										))}
									</div>
								)}
							</div>
						</DropdownSection>
					</div>
				</HorizontalWrap>
			</div>
		</>
	);
}
