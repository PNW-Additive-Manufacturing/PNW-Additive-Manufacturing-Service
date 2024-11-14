"use server";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import AccountServe from "@/app/Types/Account/AccountServe";
import Link from "next/link";
import DropdownSection from "@/app/components/DropdownSection";
import TransactionDetails from "./TransactionDetails";

export default async function Page() {

	const JWT = (await getJwtPayload())!;

	const account = (await AccountServe.queryByEmail(JWT.email))!;

	// const pendingTransaction = await AccountServe.queryPendingTransaction(
	// 	JWT.email
	// );

	const transactions = await AccountServe.queryTransactionsFor(account.email);

	// function AddFundsContainer({
	// 	amount,
	// 	disabled
	// }: {
	// 	amount: number;
	// 	disabled?: boolean;
	// }) {
	// 	disabled = disabled ?? false;

	// 	return (
	// 		<div className="bg-white rounded-md p-4 outline outline-1 outline-gray-300 flex justify-between items-center">
	// 			<div>Add ${amount.toFixed(2)}</div>
	// 			<div className="flex items-center gap-2">
	// 				<Link
	// 					href={`/api/purchase/wallet?amountInCents=${amount * 100}&paymentMethod=stripe`}>
	// 					<button
	// 						disabled={disabled}
	// 						className="mb-0 px-3 py-2 text-base bg-gradient-linear-pnw-mystic text-black">
	// 						Add Funds
	// 					</button>
	// 				</Link>
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<HorizontalWrap>
			<h1 className="w-fit text-2xl font-normal mb-1">Wallet</h1>
			<p>Wallet is a prepaid balance exclusively for ordering parts within our platform to reduce the cost of 3D Printing.</p>
			<br />
			<div className="mb-4 p-6 rounded-md text-base text-white bg-cool-black shadow-md">
				<p className="text-white text-xl font-light">
					Balance ${account.balanceInDollars.toFixed(2)}
				</p>
			</div>

			<div className="out bg-white p-6">
				<span className="font-semibold">We only accept CASH! </span>
				To deposit funds into your account, please visit the <a className="underline" href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
					PNW Design Studio
				</a> during our operating hours and speak with an officer.
				<ul className="mt-2">
					<li>If you are part of a design team or club, you can request reimbursement through a Student Services Fee (SSF) request (or COOL) using the receipt we provide.</li>
					<li>Plus, you can meet our team!</li>
				</ul>
			</div>

			<br />

			<DropdownSection className="px-0" name={"Purchase History"}>
				<div className="">
					{transactions.length == 0 ? (
						<div className="outline outline-1 outline-gray-300  px-4 py-6 bg-white rounded-md">
							You have not made any transactions.
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{transactions.map((value) => (
								<TransactionDetails transaction={value}></TransactionDetails>
							))}
						</div>
					)}
				</div>
			</DropdownSection>
		</HorizontalWrap>
	);
}

