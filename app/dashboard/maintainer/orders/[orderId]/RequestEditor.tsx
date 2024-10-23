"use client";

import {
	cancelRequest,
	fulfillRequest
} from "@/app/api/server-actions/request";
import Account from "@/app/Types/Account/Account";
import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import Request, {
	getRequestStatus,
	getRequestStatusColor,
	getTotalCost,
	hasQuote,
	isAllPriced,
	isAnyPartDenied,
	isPaid,
	RequestWithParts
} from "@/app/Types/Request/Request";
import {
	RegularCheckBox,
	RegularCog,
	RegularCrossCircle,
	RegularDatabase,
	RegularEnvelope,
	RegularExit,
	RegularFiles,
	RegularLink,
	RegularPagination,
	RegularShare,
	RegularWallet
} from "lineicons-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useFormState } from "react-dom";
import { revokePart, setQuote } from "@/app/api/server-actions/maintainer";
import PartEditor from "./PartEditor";
import Filament from "@/app/Types/Filament/Filament";
import DropdownSection from "@/app/components/DropdownSection";
import { CodeBlock, CopyBlock } from "react-code-blocks";
import RequestPricing from "@/app/components/Request/Pricing";
import StatusPill from "@/app/components/StatusPill";
import { RequestOverview } from "@/app/components/RequestOverview";
import { formateDate } from "@/app/api/util/Constants";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";

export default function RequestEditor({
	request,
	requester,
	availableFilaments
}: {
	request: RequestWithParts;
	requester: Account;
	availableFilaments: Filament[];
}): JSX.Element {
	const partsAllComplete = isAllComplete(request.parts);
	const partsAllPriced = isAllPriced(request);
	const waitingForPickup = partsAllComplete && !request.isFulfilled;
	const _hasQuote = hasQuote(request);
	const isQuotePaid = isPaid(request);

	const [showActions, setShowActions] = useState(false);
	const [showRevoke, setShowRevoke] = useState(false);
	const [quoteState, setQuoteFormAction] = useFormState(setQuote, "");
	const [fulfillState, fulfillAction] = useFormState(fulfillRequest, "");

	return (
		<>
			<div className="lg:flex justify-between items-start">
				<div className="w-full">
					<h1 className="text-4xl font-thin">
						Manage {request.name}
					</h1>
					<p className="max-lg:block mt-2 max-lg:mb-6">
						{request.firstName} {request.lastName} placed this
						request on{" "}
						{request.submitTime.toLocaleDateString("en-us", {
							weekday: "long",
							month: "short",
							day: "numeric"
						})}
						.
					</p>
				</div>
				<div className="items-end flex w-full">
					<div className="flex w-full gap-2 lg:justify-end max-lg:justify-between">
						<Link href="/dashboard/maintainer/orders">
							<button className="outline outline-1 outline-gray-300 bg-white text-black fill-black flex flex-row gap-2 justify-end items-center px-3 py-2 text-sm w-fit mb-0">
								<RegularExit className="w-auto h-6 fill-inherit"></RegularExit>
								<span className="text-sm font-medium">Go Back</span>
							</button>
						</Link>
						<div className="flex gap-2">
							<div className="relative">
								<button
									className={`px-3 py-2 text-sm outline outline-1 outline-gray-300 bg-white text-black fill-black hover:fill-white mb-0`}
									onClick={() =>
										setShowActions(!showActions)
									}>
									<span className="text-sm font-medium">Actions</span>
									<RegularCog
										className={`${showActions
											? "rotate-180"
											: "rotate-0"
											} ml-2 w-6 h-auto fill-inherit inline transition-transform ease-in-out duration-500`}></RegularCog>
								</button>
								<div
									className={`${showActions ? "" : "hidden"
										} mt-2 absolute w-fit h-fit bg-white right-0 py-2 px-2 rounded-md flex flex-col gap-1 z-10 outline outline-1 outline-gray-300`}>
									{/* <button
										className="px-3 py-2 text-sm mb-0 w-full bg-transparent text-black hover:text-black rounded-none hover:bg-transparent hover:underline"
										disabled>
										Download PDF
										<RegularFiles className="ml-2 w-6 h-6 inline-block fill-black"></RegularFiles>
									</button> */}
									<form action={fulfillAction}>
										<input
											name="requestId"
											value={request.id}
											readOnly
											hidden></input>
										<button
											className="bg-transparent px-3 py-2 text-sm mb-0 w-full text-black hover:text-black rounded-none hover:bg-transparent hover:underline"
											type="submit"
											onClick={() => setShowRevoke(true)}
											disabled={
												request.isFulfilled ||
												!isAllComplete(request.parts)
											}>
											Mark as Fulfilled
											<RegularCheckBox className="ml-2 w-6 h-6 inline-block fill-black"></RegularCheckBox>
										</button>
									</form>
									<button
										className="bg-transparent px-3 py-2 text-sm mb-0 w-full text-red-700 hover:text-red-700 rounded-none hover:bg-transparent hover:underline"
										type="button"
										onClick={() => setShowRevoke(true)}
										disabled={hasQuote(request)}>
										Revoke Request
										<RegularCrossCircle className="ml-2 w-6 h-6 inline-block fill-red-700"></RegularCrossCircle>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<hr className="my-4 lg:my-4" />

			<div className="lg:flex gap-8">
				<div className="lg:grow">
					<div className="flex flex-col gap-2 mb-3">
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
							<div className="py-2 pl-1 w-full">
								Manage {request.parts.length}{" "}
								{request.parts.length > 1 ? "Parts" : "Part"}
							</div>
							<div className={`grid ${request.parts.length > 2 && "2xl:grid-cols-2"} gap-4`}>
								{request.parts.map((part, index) => (
									<PartEditor
										request={request}
										part={part}
										index={index}
										isQuoted={_hasQuote}
										filaments={availableFilaments}
										count={request.parts.length}></PartEditor>
								))}
							</div>
						</div>
					</div>

					<DropdownSection
						name="Developer Information"
						icon={
							<RegularPagination className="inline-block w-auto h-6 pb-0.5 ml-2 fill-pnw-gold" />
						}
						collapsible={true}
						hidden={true}>
						<div className="shadow-md rounded-md p-4 lg:p-6 bg-white mb-4 outline outline-1 outline-gray-300 hover:outline-gray-400 transition-all duration-75">
							<div className="max-h-60 w-full text-sm overflow-scroll">
								<CopyBlock
									customStyle={{ width: "100%" }}
									text={JSON.stringify(
										{
											...request,
											parts: request.parts.map((part) => {
												return {
													...part,
													// Remove nested request for clarity.
													request: undefined
												};
											})
										},
										null,
										4
									)}
									language="JSON"
									showLineNumbers={false}
									codeBlock={true}
								/>
							</div>
						</div>
					</DropdownSection>
				</div>
				<div className="lg:w-92">
					<div className="py-2 pt-2 pl-1 w-full">Payment Details</div>
					<div className="p-4 lg:p-6 rounded-t-sm shadow-sm bg-white font-light outline outline-2 outline-gray-200">
						{isAllPriced(request) ? (
							<>
								<RequestPricing request={request} />
								<br />

								{hasQuote(request) && <>

									<label>Estimated Completion</label>
									<input type="date" name="estimated-completion-date" id="estimated-completion-date" readOnly value={request.quote!.estimatedCompletionDate.toISOString().split("T")[0]} required></input>

								</>}

								{isQuotePaid ? (
									<>
										<AlreadyQuoteButton
											request={request}></AlreadyQuoteButton>
									</>
								) : hasQuote(request) ? (
									<button
										className="mb-0 py-4 shadow-md text-left w-full"
										type="button">
										<div>Waiting for Payment</div>
										<p className="text-white font-light text-sm mt-1">
											{`${requester.firstName} ${requester.lastName} has been notified.`}
										</p>
									</button>
								) : (
									isAllPriced(request) && (
										<>
											<form action={setQuoteFormAction}>
												<input
													hidden
													type="number"
													name="requestId"
													readOnly
													value={request.id}></input>
												<label>Estimated Completion</label>
												<input type="date" name="estimated-completion-date" id="estimated-completion-date" min={new Date().toLocaleDateString('en-us')} required></input>
												<button
													className="py-4 shadow-md text-left flex justify-between w-full mb-0"
													disabled={!partsAllPriced}>
													<div>
														Submit Quote for $
														{getTotalCost(
															request
														).totalCost.toFixed(2)}
														<p className="text-white font-light text-sm pt-1">
															{`${requester.firstName} ${requester.lastName} will receive the quote.`}
															<FormLoadingSpinner className="fill-white ml-2" />
														</p>
													</div>
												</button>
											</form>
											<p className="text-red-500 text-base mt-2">
												{quoteState}
											</p>
										</>
									)
								)}
							</>
						) : (
							<p>Request has not been Quoted.</p>
						)}
					</div>

					<div className="py-2 pt-4 pl-1 w-full">
						Requester Information
					</div>
					<div className="p-4 lg:p-6 rounded-sm shadow-sm bg-white font-light text-base outline outline-2 outline-gray-200">
						<p className="text-2xl">
							{requester.firstName} {requester.lastName}
						</p>

						<p>{requester.yearOfStudy}</p>

						<a
							className="block mt-2 text-pnw-gold"
							href={`mailto:${requester.email}`}>
							{requester.email}
						</a>

						<p className="mt-2">
							Joined on{" "}
							{requester.joinedAt.toLocaleDateString("en-us", {
								weekday: "long",
								month: "short",
								day: "numeric"
							})}
							.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

function AlreadyQuoteButton({ request }: { request: Request }) {
	return (
		<button
			className="mb-0 py-4 shadow-md text-left bg-green-600 w-full"
			disabled>
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
