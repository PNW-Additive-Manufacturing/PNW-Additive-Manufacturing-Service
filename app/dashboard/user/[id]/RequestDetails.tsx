"use client";

import ActionResponse from "@/app/api/server-actions/ActionResponse";
import { payInvoice } from "@/app/api/server-actions/invoice";
import { cancelRequest } from "@/app/api/server-actions/request";
import { AccountContext } from "@/app/ContextProviders";
import ModelViewer from "@/app/components/ModelViewer";
import StatusPill from "@/app/components/StatusPill";
import { NamedSwatch, templatePNW } from "@/app/components/Swatch";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import {
	getStatusColor,
	isAllComplete,
	isAllPending,
	PartStatus,
	PartWithModel
} from "@/app/Types/Part/Part";
import Request, {
	getLastRefundDate,
	getRequestStatus,
	getRequestStatusColor,
	hasQuote,
	isAllPriced,
	isPaid,
	RequestWithParts
} from "@/app/Types/Request/Request";
import { Color } from "three";
import {
	RegularAlarmClock,
	RegularBriefcase,
	RegularCheckmark,
	RegularCheckmarkCircle,
	RegularCloudDownload,
	RegularCloudUpload,
	RegularCog,
	RegularCrossCircle,
	RegularExit,
	RegularFiles,
	RegularHand,
	RegularHandshake,
	RegularPackage,
	RegularWarning
} from "lineicons-react";
import Link from "next/link";
import { useContext, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Vector3 } from "three";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";
import RequestPricing from "@/app/components/Request/Pricing";
import RefundMessage from "@/app/components/Part/RefundMessage";
import FilamentBlock from "@/app/experiments/FilamentBlock";
import { formateDate, formatTime } from "@/app/api/util/Constants";
import Timeline from "@/app/components/Timeline";
import HiddenInput from "@/app/components/HiddenInput";
import { RequestOverview } from "../../../components/RequestOverview";
import { closingTime, isOpen } from "@/app/components/LocalSchedule";
import { addMinutes } from "@/app/utils/TimeUtils";
import { jsPDF } from "jspdf";
import { FaRegFilePdf } from "react-icons/fa";

export default function RequestDetails({
	request
}: {
	request: RequestWithParts;
}): JSX.Element {
	const isQuotePaid = isPaid(request);

	const [showActions, setShowActions] = useState(false);

	const [error, cancelFormAction] = useFormState<any, FormData>(
		cancelRequest,
		""
	);

	const invoiceRef = useRef<HTMLDivElement>();
	const handlePrint = useReactToPrint({ contentRef: invoiceRef as any });

	const [payState, payFormAction] = useFormState(
		async (prevState: any, data: any) => {
			const response = await payInvoice(prevState, data);

			return response;
		},
		ActionResponse.Incomplete<undefined>()
	);

	let cumulativeCost = 0;
	for (let part of request.parts) {
		if (part.priceInDollars != undefined) {
			cumulativeCost += part.priceInDollars * part.quantity;
		}
	}

	return (
		<>
			<div className="lg:flex justify-between items-start">
				<div className="w-full max-lg:mb-6">
					<h1 className="text-4xl font-thin">{request.name}</h1>

					<p className="max-lg:block mt-2">
						You placed this request on{" "}
						{request.submitTime.toLocaleDateString("en-us", {
							weekday: "long",
							month: "short",
							day: "numeric"
						})}
						.
					</p>

					{!request.isFulfilled && hasQuote(request) && !isAllComplete(request.parts) && <p className="text-pnw-gold mt-2">Estimated to be completed on {formateDate(request.quote!.estimatedCompletionDate)}.</p>}

				</div>
				<div className="items-end flex">
					<div className="flex w-full gap-2 lg:justify-end max-lg:justify-between">
						<Link href="/dashboard/user">
							<button className="mb-0 outline outline-1 outline-gray-300 bg-white text-black fill-black flex flex-row gap-2 justify-end items-center px-3 py-2">
								<RegularExit className="w-auto h-6 fill-inherit"></RegularExit>
								<span className="text-sm font-medium">Go Back</span>
							</button>
						</Link>
						<div className="relative">
							<button
								className={`mb-0 px-3 py-2 text-sm outline outline-1 outline-gray-300 bg-white text-black fill-black hover:fill-white`}
								onClick={() => setShowActions(!showActions)}>
								<span className="text-sm font-medium">Actions</span>
								<RegularCog
									className={`${showActions ? "rotate-180" : "rotate-0"
										} ml-2 w-6 h-auto fill-inherit inline transition-transform ease-in-out duration-500`}></RegularCog>
							</button>
							<div
								className={`${showActions ? "" : "hidden"
									} mt-2 absolute w-fit h-fit bg-white right-0 py-2 px-2 rounded-md flex flex-col items-end z-10 gap-1 outline outline-1 outline-gray-300`}>
								<form action={cancelFormAction}>
									<input
										type="number"
										name="requestId"
										id="requestId"
										readOnly
										value={request.id}
										hidden></input>
									<button
										type="submit"
										className="bg-transparent px-3 py-2 text-sm mb-0 w-full text-red-700 hover:text-red-700 rounded-none hover:bg-transparent hover:underline"
										disabled={
											!isAllPending(request.parts) ||
											isQuotePaid
										}>
										Cancel Request
										<RegularCrossCircle className="ml-2 w-6 h-6 inline-block fill-red-700"></RegularCrossCircle>
									</button>
									<span className="text-red-600">
										{error}
									</span>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<hr className="my-4 lg:my-4" />

			<div className="lg:flex gap-6">
				<div className="lg:grow">
					<div className="flex flex-col gap-2">
						{request.isFulfilled && (
							<RequestOverview
								title="Request Fulfilled"
								description={`Request was fulfilled on ${formateDate(
									request.fulfilledAt!
								)}.`}
							/>
						)}
						{request.comments != null && <div>

							<div className="w-full py-2 pl-1 text-nowrap">Request Specifications</div>
							<div className="shadow-sm p-4 lg:p-6 rounded-sm bg-white out">
								<p>Comments from {request.firstName} {request.lastName}: {request.comments}</p>
							</div>

						</div>}

						<div>
							<div className="w-full py-2 pl-1">
								<div className="text-nowrap">
									{"Viewing "}
									{request.parts.length}{" "}
									{request.parts.length > 1 ? "Parts" : "Part"}
								</div>
							</div>

							{!request.isFulfilled && isAllComplete(request.parts) && !request.isFulfilled && (
								<div className="mb-4 out p-4 lg:p-6 rounded-sm shadow-sm bg-white w-full">
									<p className="text-pnw-gold font-semibold"><RegularPackage className="fill-pnw-gold inline mr-2 w-5 h-5"></RegularPackage>Available for Pickup</p>
									<p>{isOpen
										? <> One of our team members are at the Design Studio. You may pickup your parts until <span className="font-semibold">{formatTime(closingTime!)}</span>.</>
										: <> Unfortunately none of our team members can assist you at this time. See our <Link className="underline" href={"/schedule"}>availability</Link>.</>}</p>
								</div>
							)}

							<div className={`grid ${request.parts.length > 2 && "2xl:grid-cols-2"} gap-4`}>
								{request.parts.map((part, index) => (
									<PartDetails
										part={part}
										index={index}
										count={request.parts.length}></PartDetails>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="lg:w-92 lg:min-w-92" style={{ minWidth: "23rem" }}>
					<div className="py-2 pl-1 w-full">Request Overview</div>
					<div className="shadow-sm p-4 lg:p-6 rounded-sm bg-white out">
						<Timeline
							options={[
								{
									title: "Requested",
									description: (
										<>
											Submitted on{" "}
											{formateDate(request.submitTime)}.
										</>
									),
									disabled: false
								},
								{
									title: "Quoted",
									description: (
										<>
											{request.quote?.paidAt == undefined
												? "Payment is pending."
												: `Paid on 
											${formateDate(request.quote?.paidAt)}.`}
										</>
									),
									disabled: !hasQuote(request)
								},
								{
									title: "Processing",
									description: (
										<>Parts are being processed.</>
									),
									disabled: isAllPending(request.parts)
								},
								{
									title: "Available for Pickup",
									description: <>{isOpen ? "Pickup at the PNW Design Studio." : "Pickup currently not Available."}</>,
									disabled: !isAllComplete(request.parts)
								},
								{
									title: "Fulfilled",
									// description: `On ${formateDate(
									// 	request.fulfilledAt!
									// )}`,
									disabled: !request.isFulfilled
								}
							]}
						/>

					</div>

					<div className="py-2 pl-1 w-full mt-2" id="payment_details">
						Payment Details
					</div>
					<div className="p-4 lg:p-6 rounded-sm shadow-sm bg-white font-light outline outline-2 outline-gray-200">
						{hasQuote(request) ? (
							<>
								<div ref={invoiceRef as any}>
									<RequestPricing request={request} />
								</div>
								<br />

								{/* PDF Document */}
								{/* <div ref={invoiceRef as any} className="bg-white"> */}
								<div ref={invoiceRef as any} className="bg-white hidden print:block">
									<div className="p-12">
										<h1 className="flex gap-4 items-center justify-between w-full mb-4 text-2xl font-medium">
											<div>
												<span className="text-pnw-gold"> PNW </span>
												Additive Manufacturing Service
											</div>
											<div className="w-10">
												<Image src={"/assets/am_cropped.png"} alt={"Additive Manufacturing"} width={480} height={480}></Image>
											</div>
										</h1>

										<p>Additive Manufacturing Club of PNW</p>
										<p>2200 169th St, Hammond, IN 46323 (Design Studio)</p>
										<p>For contact information, visit the team page at <span className="underline">pnw3d.com</span>.</p>

										<hr />

										<h2 className="text-lg mb-2 font-medium">Invoice for {request.name}:</h2>

										<div className="flex gap-12">
											{/* <div>
												<p className="mb-1">Payment Information:</p>
												<p className="text-sm">Payment Status: <span className="font-bold">{transaction.paymentStatus.toUpperCase()}</span></p>
												<p className="text-sm">Payment Method: <span className="font-bold">{transaction.paymentMethod.toUpperCase()}</span></p>
												{transaction.paidAt && <p className="text-sm">Date: <span className="font-bold">{formateDate(transaction.paidAt)}</span></p>}
											</div> */}
											<div>
												<p className="mb-1">Customer:</p>
												<p className="text-sm">Name: <span className="font-bold">{request.firstName} {request.lastName}</span></p>
												<p className="text-sm">Email: <span className="font-bold uppercase">{request.requesterEmail}</span></p>
											</div>
										</div>

										<div className="out">
											<table className="w-full mt-6">
												<thead>
													<tr>
														<th className="text-xs w-1/3 pt-4">Item</th>
														<th className="text-xs w-1/3 pt-4">Amount</th>
														<th className="text-xs w-1/3 pt-4">Quantity</th>
														<th className="text-xs pt-4">Total</th>
													</tr>
												</thead>
												<tbody>
													{request.parts.map(p => <tr>
														<td className="text-sm">{p.model.name}</td>
														<td className="text-sm">${p.priceInDollars!.toFixed(2)}</td>
														<td className="text-sm">{p.quantity}</td>
														<td className="text-sm">${(p.priceInDollars! * p.quantity).toFixed(2)}</td>
													</tr>)}
												</tbody>
											</table>

											<div className="p-4 mb-4">

												<p className="text-sm font-light flex justify-between">
													<span>Subtotal</span>
													<span className="text-right w-full"> ${(request.quote!.totalPriceInCents / 100).toFixed(2)}</span>
												</p>

												<p className="text-sm font-light flex justify-between">
													<span>Tax</span>
													<span className="text-right w-full">${(0).toFixed(2)}</span>
												</p>

												<p className="flex justify-between font-semibold">
													<span>Total</span>
													<span className="text-right w-full">${(request.quote!.totalPriceInCents / 100).toFixed(2)}</span>
												</p>
											</div>

										</div>

									</div>
								</div>

								{!isPaid && <button className="text-sm font-light text-left w-full" onClick={() => handlePrint()}>Download Invoice<FaRegFilePdf className="fill-white ml-2 mb-0.5 inline"></FaRegFilePdf></button>}

								<form action={payFormAction}>
									<input
										hidden
										type="number"
										name="requestId"
										readOnly
										value={request.id}></input>
									<RequestQuotePaymentButton
										request={request}
									/>
								</form>
								<p className="text-red-500 pl-4">
									{payState.errorMessage}
								</p>
							</>
						) : (
							<>
								<p>Request has not been Quoted.</p>
								<p className="text-sm">
									You will receive an email once Quoted.
								</p>
							</>
						)}
					</div>

					{/* {payState.isComplete &&
					payState.errorMessage == undefined ? (
						<>
							<AlreadyPaidButton
								request={request}></AlreadyPaidButton>
						</>
					) : (
						<>
							<form action={payFormAction}>
								<input
									hidden
									type="number"
									name="requestId"
									readOnly
									value={request.id}></input>
								<RequestQuotePaymentButton request={request} />
							</form>
							<p className="text-red-500 pl-4">
								{payState.errorMessage}
							</p>
						</>
					)} */}
					{/* <div className="py-2 pr-2 w-full">Contact Us</div>
					<div className="p-6 rounded-md shadow-md bg-white font-light outline outline-1 outline-gray-300">
						<div className="min-h-32">
							<p>No messages have been sent.</p>
							<p className="text-sm">
								Allow up to 48 hours for a response.
							</p>
						</div>
						<form>
							<textarea
								// TODO: Enable in the future.
								disabled={true}
								className="mt-4 mb-0 min-h-14 h-14 w-full"
								placeholder="Enter your Message"></textarea>
						</form>
					</div> */}
				</div>
			</div>
		</>
	);
}

function PartDetails({ part, index, count }: { part: PartWithModel; index: number, count: number }) {
	let statusColor = getStatusColor(part.status);
	const [revisedFile, setRevisedFile] = useState<File | undefined>(undefined);

	return (
		<div>
			{/* <progress
				value={2}
				max={5}
				className="rounded-none w-full accent-pnw-gold h-1.5 block"></progress> */}
			<div className="lg:flex gap-4 shadow-sm rounded-sm pl-4 pr-4 py-4 pt-5 lg:py-6 lg:pr-6 lg:pl-6 bg-white outline outline-2 outline-gray-200">
				<div className="w-full">
					<div className={count < 3 ? "lg:flex" : ""}>
						<div className="w-full h-fit">
							<div className="flex items-center gap-2 text-2xl mb-1 flex-wrap">
								<StatusPill
									statusColor={statusColor}
									context={part.status}></StatusPill>
								{part.model.name} x{part.quantity}
							</div>
							<div>
								{part.status == PartStatus.Denied && (
									<div className="text-red-500 w-fit">
										<HiddenInput
											required
											type="file"
											id="revision-model"
											name="revision-model"
											onChange={(f) => { }}>
											<span className="underline">
												Upload a revision
											</span>
										</HiddenInput>
										<span>
											: Model does not meet requirements (
											{part.deniedReason})
										</span>
									</div>
								)}
								<p className="my-0.5">
									<span className="font-light">
										{"Technology: "}
									</span>
									Fused Deposition Modeling
								</p>
								<>
									<span className="font-light">
										{"Filament: "}
									</span>
									{part.filament ==
										undefined ? (
										<>No longer Available</>
									) : (
										<>
											{`${part.filament.material.toUpperCase()} `}
											<NamedSwatch swatch={part.filament.color} />
										</>
									)}
								</>
								{/* <div className="mt-2 w-fit">
									<FilamentBlock
										filament={
											part.supplementedFilament ??
											part.filament!
										}
									/>
								</div> */}

								<RefundMessage part={part} />
							</div>
						</div>

						<div className={`${count > 2 ? "mt-6 w-full" : "lg:w-96"} max-lg:mt-4`}>
							<div className="shadow-sm max-lg:hidden">
								<div
									className={`w-full h-40 lg:h-52 relative outline-1 outline outline-gray-300 bg-gray rounded-sm`}>
									{revisedFile == undefined ? (
										<ModelViewer
											isAvailable={!part.model.isPurged}
											swatch={
												part.supplementedFilament
													?.color ??
												part.filament?.color
											}
											modelSize={part.model?.fileSizeInBytes}
											modelURL={`/api/download/model?modelId=${part.modelId}`}
										/>
									) : (
										<ModelViewer
											modelSize={part.model?.fileSizeInBytes}
											swatch={templatePNW()}
											modelFile={revisedFile}
										/>
									)}
								</div>
							</div>
							<a
								className="flex text-xs w-fit opacity-50 hover:opacity-100 py-2 px-1.5 text-nowrap justify-between items-center gap-2"
								href={`/api/download/model?modelId=${part.modelId}`}
								target="_blank">
								Download Model (
								{`${Math.round(
									part.model.fileSizeInBytes / 1000
								)} kB`}
								)
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function AlreadyPaidButton({ request }: { request: Request }) {
	return (
		<button className="shadow-sm text-left text-lg w-full mb-0" disabled>
			Quote Processed
			<p className="text-white font-light text-sm">
				Paid on{" "}
				{request.quote!.paidAt!.toLocaleDateString("en-us", {
					weekday: "long",
					month: "short",
					day: "numeric"
				})}
				.
			</p>
		</button>
	);
}

function RequestQuotePaymentButton({ request }: { request: RequestWithParts }) {
	const { account } = useContext(AccountContext);
	const partsAllPriced = isAllPriced(request);
	const quoteAvailable = hasQuote(request);

	if (quoteAvailable && request.quote!.isPaid) {
		return <AlreadyPaidButton request={request}></AlreadyPaidButton>;
	}

	if (!partsAllPriced || !quoteAvailable) {
		return (
			<button className="shadow-md text-left w-full mb-0" disabled>
				<div>Pay with Wallet</div>
			</button>
		);
	}

	const cumulativeCost = request.parts.reduce(
		(sum, part) => sum + (part.priceInDollars || 0),
		0
	);

	if (cumulativeCost > account!.balanceInDollars) {
		return (
			<button className="shadow-md text-left w-full mb-0" disabled>
				Pay with Wallet
				<Link href={"/user/profile#wallet"} className="block">
					<p className="text-white font-light text-sm underline">
						You lack the required balance.
					</p>
				</Link>
			</button>
		);
	}

	return (
		<button className="shadow-md text-left flex justify-between w-full mb-0 animate-none hover:animate-pulse">
			<div>
				Pay with Wallet
				<p className="text-white font-light text-sm mt-1">
					Balance after Transaction: $
					{(account!.balanceInDollars - cumulativeCost).toFixed(2)}
				</p>
			</div>
		</button>
	);
}