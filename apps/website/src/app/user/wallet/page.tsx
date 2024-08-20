"use server";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { AccountContext } from "@/app/ContextProviders";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import AccountServe from "@/app/Types/Account/AccountServe";
import { WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import {
	RegularChevronDown,
	RegularCirclePlus,
	RegularFiles,
	RegularGift,
	RegularList,
	RegularQuestionCircle
} from "lineicons-react";
import Link from "next/link";
import { useContext } from "react";

export default async function Page() {
	// const accountDetails = useContext(authContext);

	const JWT = (await getJwtPayload())!;

	const account = (await AccountServe.queryByEmail(JWT.email))!;

	const pendingTransaction = await AccountServe.queryPendingTransaction(
		JWT.email
	);

	const transactions = await AccountServe.queryTransactionsFor(account.email);

	function AddFundsContainer({
		amount,
		disabled
	}: {
		amount: number;
		disabled?: boolean;
	}) {
		disabled = disabled ?? false;

		return (
			<div className="bg-white rounded-md p-4 outline outline-1 outline-gray-300 flex justify-between items-center">
				<div>Add ${amount.toFixed(2)}</div>
				<div className="flex items-center gap-2">
					{/* <span className="text-sm">Payment serviced by Stripe</span> */}
					<Link
						href={`/api/purchase/wallet?amountInCents=${
							amount * 100
						}&paymentMethod=stripe`}>
						<button
							disabled={disabled}
							className="mb-0 px-3 py-2 text-base bg-gradient-linear-pnw-mystic text-black">
							Add Funds
						</button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<HorizontalWrap>
			<h1 className="text-3xl tracking-wide font-light">Your Wallet</h1>
			<br />
			<div className="mb-4 p-6 rounded-md text-base text-white bg-cool-black shadow-md">
				<p className="text-white text-2xl font-light">
					Balance ${account.balanceInDollars.toFixed(2)}
				</p>
			</div>
			<div className="px-3 flex gap-2 overflow-x-visible">
				<button className="px-3 py-2 text-sm w-auto flex flex-row max-lg:justify-between gap-2 items-center bg-gray-200 text-black">
					Redeem Gift
					<RegularGift className="w-auto h-4 fill-inherit"></RegularGift>
				</button>
				<button className="px-3 py-2 text-sm w-auto flex flex-row max-lg:justify-between gap-2 items-center bg-gray-200 text-black">
					Download PDF
					<RegularFiles className="w-auto h-4 fill-inherit"></RegularFiles>
				</button>
			</div>

			{/* {pendingTransaction == undefined ? (
				<></>
			) : (
				<div className="px-4 py-6 bg-yellow-700 text-white">
					A transaction is pending!
				</div>
			)} */}

			<div className="flex flex-col gap-4">
				<AddFundsContainer
					amount={5}
					disabled={!!pendingTransaction}></AddFundsContainer>
				<AddFundsContainer
					amount={10}
					disabled={!!pendingTransaction}></AddFundsContainer>
				<AddFundsContainer
					amount={20}
					disabled={!!pendingTransaction}></AddFundsContainer>
				<AddFundsContainer
					amount={30}
					disabled={!!pendingTransaction}></AddFundsContainer>
			</div>

			<br />
			<div className="py-2 pr-2 w-full flex justify-between items-center">
				<span>Transaction History</span>
				<RegularChevronDown
					className={`fill-slate-500 w-5 h-5 ${
						true ? "rotate-0" : "rotate-180"
					} transition-transform`}></RegularChevronDown>
			</div>
			<div className="">
				{transactions.length == 0 ? (
					<div className="outline outline-1 outline-gray-300  px-4 py-6 bg-white rounded-md">
						You have not made any transactions.
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{transactions.map((value) => (
							<div
								className={`px-4 py-6 outline outline-1 ${
									value.paymentStatus ==
									WalletTransactionStatus.Paid
										? "outline-gray-300"
										: "outline-yellow-700"
								} bg-white rounded-md flex justify-between items-center`}>
								<div className="flex text-lg items-center">
									{value.paymentStatus ==
									WalletTransactionStatus.Paid ? (
										<RegularCirclePlus className="h-6 w-auto fill-green-600 mr-2"></RegularCirclePlus>
									) : (
										<RegularCirclePlus className="h-6 w-auto fill-yellow-700 mr-2"></RegularCirclePlus>
										// <RegularQuestionCircle className="h-7 w-auto fill-gray-500 mr-2"></RegularQuestionCircle>
									)}
									${(value.amountInCents / 100).toFixed(2)}
								</div>
								<div className="text-sm">
									{value.paymentStatus ==
									WalletTransactionStatus.Paid ? (
										<>
											{value.paymentMethod.toUpperCase()}{" "}
											On{" "}
											{value.paidAt!.toLocaleDateString(
												"en-us",
												{
													weekday: "long",
													month: "short",
													day: "numeric",
													hour: "numeric"
												}
											)}
										</>
									) : value.paymentStatus ==
									  WalletTransactionStatus.Cancelled ? (
										"Cancelled"
									) : (
										<Link href="/api/purchase/wallet">
											<button className="max-lg:w-full mb-0 lg:mb-0 px-3 py-2 text-sm bg-yellow-700">
												Complete Transaction
											</button>
										</Link>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<br />
			<p className="text-sm">
				Wallet is neither a bank account nor any kind of payment
				instrument. It functions as a prepaid balance to order products.
				Zero obligation to refund any balance remaining on your wallet
				unless specifically contacted.
			</p>
		</HorizontalWrap>
	);
}
