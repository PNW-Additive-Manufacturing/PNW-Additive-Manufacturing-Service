"use client";

import ActionResponse from "@/app/api/server-actions/ActionResponse";
import { payInvoice } from "@/app/api/server-actions/invoice";
import { cancelRequest } from "@/app/api/server-actions/request";
import { AccountContext } from "@/app/ContextProviders";
import ThreeModelViewer from "@/app/components/ThreeModelViewer";
import StatusPill from "@/app/components/StatusPill";
import { NamedSwatch, templatePNW } from "@/app/components/Swatch";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import {
	getStatusColor,
	isAllComplete,
	isAllPending,
	isRevoked,
	PartStatus,
	PartWithModel
} from "@/app/Types/Part/Part";
import Request, {
	getLastRefundDate,
	getLeadTimeInDays,
	getRequestStatus,
	getRequestStatusColor,
	calculateTotalCost,
	hasQuote,
	isAllPriced,
	isPaid,
	RequestWithParts,
	getCosts,
	RequestCosts
} from "@/app/Types/Request/Request";
import { Color } from "three";
import {
	RegularAlarmClock,
	RegularArrowRight,
	RegularBriefcase,
	RegularCheckmark,
	RegularCheckmarkCircle,
	RegularCloudDownload,
	RegularCloudUpload,
	RegularCog,
	RegularCrossCircle,
	RegularDownload,
	RegularExit,
	RegularFiles,
	RegularFlag,
	RegularHand,
	RegularHandshake,
	RegularPackage,
	RegularStarEmpty,
	RegularStarFill,
	RegularStarHalf,
	RegularWallet,
	RegularWarning
} from "lineicons-react";
import Link from "next/link";
import { useContext, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Vector3 } from "three";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";
import RefundMessage from "@/app/components/Part/RefundMessage";
import FilamentBlock from "@/app/experiments/FilamentBlock";
import { formateDate, formateDateWithTime, formatTime } from "@/app/api/util/Constants";
import Timeline from "@/app/components/Timeline";
import HiddenInput from "@/app/components/HiddenInput";
import { RequestOverview } from "../../../components/RequestOverview";
import { closingTime, isOpen } from "@/app/components/LocalSchedule";
import { addMinutes } from "@/app/utils/TimeUtils";
import { jsPDF } from "jspdf";
import { FaBox, FaCheck, FaRegFilePdf } from "react-icons/fa";
import Account from "@/app/Types/Account/Account";
import { DownloadItemizedReceipt, ItemizedPartTable, RequestTotals } from "@/app/components/Request/Pricing";
import DropdownSection from "@/app/components/DropdownSection";
import useClipboard from "@/app/hooks/useClipboard";
import { toast } from "react-toastify";
import { Figure } from "@/app/components/Figures";
import classNames from "classnames";
import ContainerNotification from "@/app/components/ContainerNotification";

export function createRequestTimelineOptions(request: RequestWithParts) {
	console.log(request);
	return [
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
					{request.quote?.paidAt === undefined ? "Waiting for payment from you." : `Paid on ${formateDate(request.quote?.paidAt)}.`}
				</>
			),
			disabled: !hasQuote(request)
		},
		{
			title: "Models Printing",
			description: <>
				Estimated to be completed by {request.quote && formateDate(request.quote.estimatedCompletionDate)}.
			</>,
			disabled: isAllPending(request.parts)
		},
		{
			title: "Available for Pickup",
			description: <>{isOpen ? "Pickup at the PNW Design Studio." : "Pickup currently not Available."}</>,
			disabled: !isAllComplete(request.parts)
		},
		{
			title: "Fulfilled",
			disabled: !request.isFulfilled
		}
	];
}

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

	let costs = request.quote ? getCosts(request.quote) : undefined;

	return (
		<>
			<div className="lg:flex justify-between items-start">
				{/* Title */}
				<div className="w-full">
					<h1 className="text-2xl font-thin">{request.name}</h1>
					<p className="max-lg:block mt-2 max-lg:mb-6 text-sm">
						You placed this request on{" "}
						{formateDateWithTime(request.submitTime)}
					</p>

					{/* {!request.isFulfilled && hasQuote(request) && !isAllComplete(request.parts) && <p className="text-pnw-gold mt-2">Estimated to be completed on {formateDate(request.quote!.estimatedCompletionDate)}.</p>} */}
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

			{/* <div
				className="rounded-md p-5 w-full my-4 text-xs flex justify-between shadow-lg gap-6"
				style={{
					background: "linear-gradient(30deg, rgba(185,134,23,0.75) 0%, rgba(177,129,11,0.75) 30%, rgba(238,186,24,0.75) 100%)",
				}}>

				<div>
					<h2 className="text-xl font-bold">Reviewing your Request</h2>
					<p className="text-lg font-semibold text-white">We are determining your Order.</p>
				</div>

				<div>
					<h2 className="text-xl font-bold">Reviewing your Request</h2>
					<p className="text-lg font-semibold text-amber-400">We are determining your Order.</p>
				</div>

			</div> */}

			<hr className="my-4 lg:my-4" />

			<div className="lg:flex gap-6">
				<div className="lg:grow">
					<div className="flex flex-col gap-2 mb-3">

						{(request.isFulfilled || isAllComplete(request.parts) || request.comments != null) && <div>
							<div className="text-sm py-2 px-1 text-nowrap">Messages</div>

							<div className="flex flex-col gap-2">
								{request.isFulfilled && <ContainerNotification title={"Request is Fulfilled"} description={`You picked up this request on ${formateDate(request.fulfilledAt!)}`}
									icon={<FaCheck className="fill-pnw-gold inline mr-2 w-3 h-3 mb-0.5" />
									} />}

								{!request.isFulfilled && isAllComplete(request.parts) && (

									<ContainerNotification title={"Available for Pickup"}
										icon={<FaBox className="fill-pnw-gold inline mr-2 w-3 h-3 mb-0.5" />}
										description={isOpen
											? <> One of our team members are at the Design Studio. You may pickup your parts until <span className="font-semibold">{formatTime(closingTime!)}</span>.</>
											: <> Unfortunately none of our team members can assist you at this time. See our <Link className="underline" href={"/schedule"}>availability</Link>.</>} />
								)}

								{request.comments != null && <ContainerNotification title={`Your specifications for this Request`} description={request.comments} />}
							</div>

						</div>}

						<div>
							<div className="text-sm py-2 px-1 text-nowrap">
								{"Viewing "}
								{request.parts.length}{" "}
								{request.parts.length > 1 ? "Parts" : "Part"}
							</div>

							<div className={`grid 2xl:grid-cols-2 w-full gap-4`}>
								{request.parts.map((part, index) => (
									<PartDetails
										part={part}
										index={index}
										count={request.parts.length}></PartDetails>
								))}
								{request.parts.length == 1 && <div className="bg-white out opacity-50 h-full max-2xl:hidden"></div>}
							</div>
						</div>
					</div>
				</div>
				<div className="w-full lg:w-1/3 xl:w-2/6" >
					<div className="text-sm py-2 pl-1 w-full">Status Tracking</div>
					<div className="shadow-sm p-4 lg:p-6 rounded-sm bg-white out">
						<Timeline options={createRequestTimelineOptions(request)} />
					</div>

					<div className="text-sm py-2 mt-2 px-1 text-nowrap" id="payment_details">{isPaid(request) ? "Receipt" : "Invoice"}</div>

					<div className="p-4 lg:p-6 rounded-sm shadow-sm bg-white font-light outline outline-2 outline-gray-200">
						{hasQuote(request) ? (
							<>
								<UserQuote request={request} />

								<form action={payFormAction}>
									<input
										hidden
										type="number"
										name="requestId"
										readOnly
										value={request.id}></input>
									<RequestQuotePaymentButton
										request={request}
										costs={costs!}
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

function UserQuote({ request }: { request: RequestWithParts }) {
	const { account: requester } = useContext(AccountContext);

	const calculatedData = useMemo(() => {
		const costs = hasQuote(request) ? getCosts(request.quote!) : undefined;
		const leadTime = getLeadTimeInDays(request.parts.map(p => p.filament!.leadTimeInDays));
		const hasEnoughBalance = costs != null ? requester!.balanceInDollars >= costs.totalCost : undefined;

		return { costs, leadTime, hasEnoughBalance };
	}, [request, requester]);

	return <>

		{/* Display the totals and buttons to manage the invoice/quote */}
		<div>
			{/* <hr className="my-4 mt-6" /> */}
			{isAllPriced(request) && <>

				<div className="flex justify-between gap-5">
					<RequestTotals costs={calculatedData.costs!} />
				</div>
				<hr className="mb-4" />

			</>}

			<DropdownSection className="mb-3 text-sm font-light px-0 pb-0 mt-0 pt-0" name={`Itemized ${isPaid(request) ? "Receipt" : "Invoice"}`} hidden={false}>
				{/* Show the itemized costs of each part even if not priced yet */}
				<ItemizedPartTable parts={request.parts} />

				{hasQuote(request) && <div className="mt-4">
					<DownloadItemizedReceipt request={request} />
				</div>}

			</DropdownSection>

			{!isAllPriced(request) && <button disabled={true} className="text-sm text-left mb-0">
				Not all parts have not been assigned a cost!
			</button>}

			{/* {hasQuote(request) && (isPaid(request) ? <AlreadyQuoteButton request={request} /> : <WaitingForPaymentButton request={request} />)} */}
		</div>
	</>
}

function PartDetails({ part, index, count }: { part: PartWithModel; index: number, count: number }) {
	let statusColor = getStatusColor(part.status);

	return (
		<div className=" gap-4 h-full shadow-sm out w-full bg-white">
			<div className={classNames("w-full p-4 lg:p-6")}>
				<div className="flex w-full items-center gap-4 mb-2">
					<p className="w-full truncate text-base font-medium">{part.model.name}</p>

					<StatusPill
						statusColor={statusColor}
						context={part.status}></StatusPill>
				</div>

				<div className={"w-full flex gap-4 flex-col-reverse"}>
					<div className={classNames("h-full out relative", "w-full")}>
						{/* <div className="absolute top-2 left-2 p-2 stroke-cool-black hover:stroke-pnw-gold opacity-25 hover:cursor-pointer hover:opacity-100 fill-transparent hover:fill-pnw-gold z-20 flex items-center justify-center" style={{ borderRadius: "100%" }}>
							<RegularStarFill className="stroke-inherit fill-inherit opacity-100 w-4 h-4" style={{ strokeWidth: "6px" }} />
						</div> */}
						<div className="h-36 bg-gray-50 rounded-sm w-full">
							<ThreeModelViewer
								isAvailable={!part.model.isPurged}
								modelSize={part.model?.fileSizeInBytes}

								modelURL={`/api/download/model?modelId=${part.modelId}`}></ThreeModelViewer>
						</div>
						<div>
							<div className="bg-background text-subtle w-full p-3 text-xs rounded-b-sm">
								<div className="flex gap-2 flex-wrap justify-between items-start">
									<div className="shrink">
										{/* This needs to go to user-facing dashboard */}
										{/* {isRevoked(part) && <a className={`text-warning fill-warning mb-0.5 text-right block`}
															href={part.model.isPurged ? undefined : `/api/download/model?modelId=${part.modelId}`}
															download={`${part.model.name}.stl`}
															target="_blank">
															Upload Revision
															<RegularUpload className="ml-2 inline mb-0.5 fill-inherit" />
														</a>} */}
										{!part.model.isPurged && <a className={`text-gray-500 fill-gray-500 hover:text-black text-right hover:fill-black text-nowrap block`}
											href={part.model.isPurged ? undefined : `/api/download/model?modelId=${part.modelId}`}
											download={`${part.model.name}.stl`}
											target="_blank">
											Download Model
											<RegularDownload className="ml-2 inline mb-0.5 fill-inherit" />
										</a>}
									</div>

								</div>

								{isRevoked(part) &&
									<div className="mt-2 flex flex-wrap gap-x-2">
										<p className="text-warning">{part.deniedReason}</p>
									</div>}
							</div>
						</div>
					</div>
					<div className="text-sm flex w-full flex-col gap-0.5">


						<Figure name={"Manufacturing Process:"} amount={part.supplementedFilament?.technology ?? part.filament?.technology} style={"inline"} />

						<Figure name="Filament:" style="inline" amount={<>

							{`${part.filament!.material.toUpperCase()} `}
							<NamedSwatch swatch={part.filament!.color} style="compact" />

							{part.supplementedFilament != undefined && (
								<>
									<RegularArrowRight className="inline mx-2 fill-gray-500" style={{ marginBottom: "3px" }} />
									{`${part.supplementedFilament.material.toUpperCase()} `}
									<NamedSwatch swatch={part.supplementedFilament.color} style="compact" />
								</>
							)}

						</>} />
						{part.supplementedFilament != null && <Figure name={"Supplemented Reason:"} amount={part.reasonForSupplementedFilament ?? "None was provided!"} style={"inline"} />}

						<Figure name={"Quantity:"} amount={`x${part.quantity}`} style={"inline"} />
					</div>
				</div>
			</div>
		</div >
	);
}

function AlreadyPaidButton({ request }: { request: Request }) {
	return (
		<button className="shadow-sm text-left text-sm w-full mb-0" disabled>
			Quote Processed
			<p className="text-white font-light text-xs mt-1">
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

function RequestQuotePaymentButton({ request, costs }: { request: RequestWithParts, costs: RequestCosts }) {
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

	if (costs.totalCost > account!.balanceInDollars) {
		return (
			<button className="shadow-md text-left text-base w-full mb-0" disabled>
				Pay with Wallet
				<Link href={"/user/profile#wallet"} className="block">
					<p className="text-white font-light text-xs underline">
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
					{(account!.balanceInDollars - costs.totalCost).toFixed(2)}
				</p>
			</div>
		</button>
	);
}