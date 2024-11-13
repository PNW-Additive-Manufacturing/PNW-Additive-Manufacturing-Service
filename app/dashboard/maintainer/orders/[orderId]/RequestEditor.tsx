"use client";

import {
	deleteRequest,
	fulfillRequest
} from "@/app/api/server-actions/request";
import Account, { AccountPermission } from "@/app/Types/Account/Account";
import { isAllComplete } from "@/app/Types/Part/Part";
import Request, {
	getTotalCost,
	hasQuote,
	isAllPriced,
	isPaid,
	RequestWithEmails,
	RequestWithParts
} from "@/app/Types/Request/Request";
import {
	RegularCheckBox,
	RegularCog,
	RegularExit,
	RegularEye,
	RegularPagination,
	RegularPlay,
	RegularPlayStoreFill,
	RegularReload,
	RegularSearchAlt,
	RegularStarFill,
	RegularTrashCan,
} from "lineicons-react";
import { FiActivity } from "react-icons/fi";
import { useContext, useState } from "react";
import { useFormState } from "react-dom";
import { setQuote } from "@/app/api/server-actions/maintainer";
import PartEditor from "./PartEditor";
import Filament from "@/app/Types/Filament/Filament";
import DropdownSection from "@/app/components/DropdownSection";
import RequestPricing from "@/app/components/Request/Pricing";
import { RequestOverview } from "@/app/components/RequestOverview";
import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import Machine from "@/app/components/Machine";
import { AccountContext } from "@/app/ContextProviders";
import { addMinutes } from "@/app/utils/TimeUtils";
import usePrinters from "@/app/hooks/usePrinters";
import Link from "next/link";

export default function RequestEditor({
	request,
	requester,
	availableFilaments
}: {
	request: RequestWithParts & RequestWithEmails;
	requester: Account;
	availableFilaments: Filament[];
}): JSX.Element {
	const partsAllPriced = isAllPriced(request);
	const _hasQuote = hasQuote(request);
	const isQuotePaid = isPaid(request);

	const [showActions, setShowActions] = useState(false);
	const [showRevoke, setShowRevoke] = useState(false);
	const [quoteState, setQuoteFormAction] = useFormState(setQuote, "");
	const [fulfillState, fulfillAction] = useFormState(fulfillRequest, "");
	const [deleteRequestError, deleteRequestAction] = useFormState(deleteRequest, "");

	const machineData = usePrinters(true, 60);

	let printingMachines: string[] = [];
	let totalGrams = 0;
	let maxLeadTime = 0;
	let totalPriceInCents = 0;
	let isAllAnalyzed = true;
	let allAnalysisMachines: string[] = [];
	for (const part of request.parts) {
		if (part.filament && part.filament.leadTimeInDays > maxLeadTime) {
			maxLeadTime = part.filament.leadTimeInDays;
		}

		if (part.model && part.model.analysisResults) {
			totalGrams += part.model!.analysisResults!.estimatedFilamentUsedInGrams;


			if (part.filament) {
				totalPriceInCents += part.model!.analysisResults.estimatedFilamentUsedInGrams * part.quantity * part.filament.costPerGramInCents;
			}

			if (allAnalysisMachines.indexOf(part.model.analysisResults.machineModel) == -1) {
				allAnalysisMachines.push(part.model.analysisResults.machineModel);
			}
		}
		else if (isAllAnalyzed) {
			isAllAnalyzed = false;
		}

		if (machineData.machines) {
			for (let currentMachine of machineData.machines) {
				if (currentMachine.filename?.toLowerCase()?.includes(part.model.name.toLowerCase()) && !(currentMachine.identifier in printingMachines)) {
					printingMachines.push(currentMachine.identifier);
				}
			}
		}
	}

	return (
		<>
			<div className="lg:flex justify-between items-start">
				<div className="w-full">
					<h1 className="text-2xl font-thin">
						Manage {request.name}
					</h1>
					<p className="max-lg:block mt-2 max-lg:mb-6 text-sm">
						{request.firstName} {request.lastName} placed this
						request on{" "}
						{request.submitTime.toLocaleDateString("en-us", {
							weekday: "long",
							month: "short",
							day: "numeric",
							hour: "numeric"
						})}
						.
					</p>
					{/* <p className="text-xs"><RegularSearchAlt className="inline"></RegularSearchAlt> Copy printing name to Clipboard</p> */}
					{/* <p className="mt-2 opacity-50 text-sm">{request.firstName} {request.lastName} - {request.parts.map(p => p.model.name).join(", ")}</p> */}
				</div>

				<div className="items-end flex w-full">
					<div className="flex w-full gap-2 lg:justify-end max-lg:justify-between">
						<Link href="/dashboard/maintainer/orders">
							<button className="outline outline-1 outline-gray-300 bg-white text-black fill-black px-3 py-2 text-sm w-fit mb-0">
								<RegularExit className="inline mb-0.5 fill-inherit"></RegularExit> <span className="text-sm font-normal">Go Back</span>
							</button>
						</Link>
						<div className="flex gap-2">
							<div className="relative">
								<button
									className={`px-3 py-2 text-sm outline outline-1 outline-gray-300 bg-white text-black fill-black hover:fill-white mb-0`}
									onClick={() =>
										setShowActions(!showActions)
									}>
									<RegularCog
										className={`${showActions
											? "rotate-180"
											: "rotate-0"
											} mb-0.5 h-auto fill-inherit inline transition-transform ease-in-out duration-500`} /> <span className="text-sm font-normal">Actions</span>
								</button>
								<div
									className={`${showActions ? "" : "hidden"} mt-2 absolute w-fit h-fit bg-white right-0 py-2 px-2 rounded-md flex flex-col gap-1 z-10 outline outline-1 outline-gray-300`}>
									<form action={fulfillAction}>
										<input name="requestId" value={request.id} readOnly hidden></input>
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
									<form action={deleteRequestAction}>
										<input name="requestId" value={request.id} readOnly hidden></input>
										<button
											className="bg-transparent px-3 py-2 text-sm mb-0 w-full text-red-700 hover:text-red-700 rounded-none hover:bg-transparent hover:underline"
											type="submit"
											disabled={isPaid(request)}>
											Delete Request
											<RegularTrashCan className="ml-2 w-6 h-6 inline-block fill-red-700"></RegularTrashCan>
										</button>
										<p>{deleteRequestError}</p>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<hr className="my-4 lg:my-4" />

			<div className="lg:flex gap-6">
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
							<div className="flex flex-wrap gap-4 justify-between items-center py-2 px-1 w-full">
								<span>Manage {request.parts.length} {request.parts.length > 1 ? "Parts" : "Part"}</span>
								<div className="flex flex-wrap gap-y-4 gap-x-2 text-sm">

									{printingMachines.length > 0 && <span className="font-light">
										{/* <RegularReload className="inline fill-pnw-gold opacity-80 animate-spin" style={{ marginBottom: "3px" }} />  */}
										<FiActivity className="inline stroke-pnw-gold" style={{ marginBottom: "3px" }} /> Printing on <span className="font-medium">{printingMachines.join(", ")}</span>
									</span>}

									{(totalGrams > 0 || totalPriceInCents > 0) && <div className="bg-background xl:px-1 rounded-md">
										<RegularStarFill className="inline fill-pnw-gold opacity-75" style={{ marginBottom: "3px" }} />
										<span className="font-light "> Analysis using {allAnalysisMachines.join(", ")} </span>
										<span className="font-medium">
											${(totalPriceInCents / 100).toFixed(2)} consuming {Math.round(totalGrams)} Grams
											{!isAllAnalyzed && <> (Incomplete)</>}
										</span>
									</div>}
								</div>
							</div>

							<div className={`grid ${request.parts.length > 2 && "2xl:grid-cols-2"} gap-4`}>
								{request.parts.map((part, index) => {
									const printStatus = machineData?.machines == null ? null : machineData.machines!.find(m => {
										return m.filename == null ? false : m.filename.toLowerCase().includes(part.model.name.toLowerCase());
									});

									return <PartEditor
										request={request}
										part={part}
										index={index}
										isQuoted={_hasQuote}
										filaments={availableFilaments}
										count={request.parts.length}
										processingMachine={printStatus} />
								})}
							</div>
						</div>
					</div>

					{/* {useContext(AccountContext).account?.permission == AccountPermission.Admin && <DropdownSection
						name="Developer Information"
						icon={
							<RegularPagination className="inline-block w-auto h-6 pb-0.5 ml-2 fill-pnw-gold" />
						}
						collapsible={true}
						hidden={true}>
						<div className="shadow-md rounded-md p-4 lg:p-6 bg-white mb-4 outline outline-1 outline-gray-300 hover:outline-gray-400 transition-all duration-75">
							<div className="max-h-60 w-full text-sm overflow-scroll">
								{JSON.stringify(
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
							</div>
						</div>
					</DropdownSection>} */}
				</div>
				<div className="w-full lg:w-1/3 xl:w-2/6" >
					<div className="py-2 pt-2 px-1 w-full">Invoice</div>
					<div className="p-4 lg:p-6 rounded-t-sm shadow-sm bg-white font-light outline outline-2 outline-gray-200">
						{isAllPriced(request) ? (
							<>
								<RequestPricing request={request} />

								<div className="gap-4 mt-4">

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
												<form action={setQuoteFormAction} className="w-full">
													<input
														hidden
														type="number"
														name="requestId"
														readOnly
														value={request.id}></input>
													<input className="py-2" type="date" name="estimated-completion-date" id="estimated-completion-date" min={new Date().toLocaleDateString('en-us')} required></input>
													<button
														className="py-4 shadow-md text-left text-sm flex justify-between w-full mb-0"
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
												{quoteState && <p className="text-red-500 text-base mt-2">
													{quoteState}
												</p>}
											</>
										)
									)}
								</div>
							</>
						) : (
							<>
								<p>Request has not been Quoted.</p>
								<span className="text-sm mt-2">All parts must be priced before submission.</span>
							</>
						)}
					</div>

					<div className="py-2 pt-4 px-1 w-full">
						Requester Information
					</div>
					<div className="p-4 lg:p-6 rounded-sm shadow-sm bg-white font-light outline outline-2 outline-gray-200">
						<p className="text-xl">
							{requester.firstName} {requester.lastName}
						</p>

						<a
							className="block my-2 text-pnw-gold text-sm"
							href={`mailto:${requester.email}`}>
							Contact at {requester.email}
						</a>

						<p className="text-sm">{requester.yearOfStudy} joined {requester.joinedAt.toLocaleDateString("en-us", {
							weekday: "long",
							month: "short",
							day: "numeric"
						})}.</p>


						<DropdownSection name={"Email Performance"} className="px-0 text-sm mt-2">
							<table className="bg-background px-1 py-2 w-full mt-1 out">
								<thead>
									<tr>
										<th className="pt-3 text-xs">Message</th>
										<th className="pt-3 text-xs">Status</th>
									</tr>
								</thead>
								<tbody>
									{request.emails.map(email => <>
										<tr className="bg-transparent">
											<td className="first-letter:uppercase text-sm">{email.kind}</td>
											<td className="text-sm">{email.seenAt == null ? <span><RegularEye className="inline fill-cool-black mb-0.5" /> Unclicked</span> : <span><RegularEye className="inline fill-pnw-gold mb-0.5" /> {email.seenAt.toLocaleDateString("en-us", {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit"
											})}</span>}</td>
										</tr>
									</>
									)}
								</tbody >
							</table>
						</DropdownSection>
					</div>
				</div>
			</div>
		</>
	);
}

function AlreadyQuoteButton({ request }: { request: Request }) {
	return (
		<button
			className="mb-0 shadow-md text-left text-sm w-full"
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
