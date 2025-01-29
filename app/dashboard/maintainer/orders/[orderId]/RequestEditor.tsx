"use client";

import {
	deleteRequest,
	fulfillRequest
} from "@/app/api/server-actions/request";
import classnames from "classnames";
import Account, { AccountPermission } from "@/app/Types/Account/Account";
import { isAllComplete, PartStatus } from "@/app/Types/Part/Part";
import Request, {
	getLeadTimeInDays,
	calculateTotalCost,
	hasQuote,
	isAllPriced,
	isPaid,
	RequestCosts,
	RequestWithEmails,
	RequestWithParts,
	getCosts
} from "@/app/Types/Request/Request";
import {
	RegularCheckBox,
	RegularCheckmark,
	RegularCheckmarkCircle,
	RegularCirclePlus,
	RegularCog,
	RegularCrossCircle,
	RegularExit,
	RegularEye,
	RegularPagination,
	RegularPause,
	RegularPlay,
	RegularPlayStoreFill,
	RegularReload,
	RegularSearchAlt,
	RegularStarFill,
	RegularTimer,
	RegularTrashCan,
	RegularWallet,
} from "lineicons-react";
import { FiActivity } from "react-icons/fi";
import { useCallback, useContext, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { setQuote } from "@/app/api/server-actions/maintainer";
import PartEditor from "./PartEditor";
import Filament from "@/app/Types/Filament/Filament";
import DropdownSection from "@/app/components/DropdownSection";
import { DownloadItemizedReceipt, ItemizedPartTable, RequestTotals } from "@/app/components/Request/Pricing";
import { RequestOverview } from "@/app/components/RequestOverview";
import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import Machine from "@/app/components/Machine";
import { AccountContext } from "@/app/ContextProviders";
import { addMinutes } from "@/app/utils/TimeUtils";
import usePrinters from "@/app/hooks/usePrinters";
import Link from "next/link";
import RevokeInput from "@/app/components/RevokeInput";
import useAPIFormState from "@/app/hooks/useAPIFormState";
import { FloatingFormContext } from "@/app/components/FloatingForm";
import { LabelWithIcon } from "@/app/components/LabelWithIcon";
import classNames from "classnames";
import { Figure } from "@/app/components/Figures";
import ContainerNotification from "@/app/components/ContainerNotification";
import { FaCheck } from "react-icons/fa";

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
	const [fulfillState, fulfillAction] = useFormState(fulfillRequest, "");
	const [deleteRequestError, deleteRequestAction] = useFormState(deleteRequest, "");

	const machineData = usePrinters(true, 60);

	const analysisData = useMemo(() => {
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

			// part.model.analysisResults = {
			// 	estimatedDuration: "20",
			// 	estimatedFilamentUsedInGrams: 20,
			// 	machineManufacturer: "Bambu Lab",
			// 	machineModel: "X1C"
			// };

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
						break;
					}
				}
			}
		}

		// printingMachines = ["Kachow", "Cinder Block"];

		return { printingMachines, totalGrams, maxLeadTime, totalPriceInCents, isAllAnalyzed, allAnalysisMachines };
	}, [machineData]);

	return (
		<>
			<div className="lg:flex justify-between items-start">
				<div className="w-full">
					<h1 className="text-2xl font-thin">
						Manage {request.name}
					</h1>
					<p className="max-lg:block mt-2 max-lg:mb-6 text-sm">
						{`${request.firstName} ${request.lastName} placed this request on ${formateDateWithTime(request.submitTime)}`}.
					</p>
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
											disabled={request.isFulfilled}>
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

			<div className="out p-4 my-4 bg-white text-xs flex flex-col sm:flex-row gap-2 md:gap-x-6 md:gap-y-4">

				<Figure name={"Needed By"} style={"small"} icon={<RegularTimer style={{ marginBottom: "4px" }} />} iconPosition="start" amount={formateDateWithTime(request.needBy)} />

				<div className="rounded-lg" style={{ borderLeftWidth: "2px", borderColor: "#e5e7eb" }} />

				<Figure
					name={"Automatic Analysis"} style={"small"}
					labelClassName={classNames({ "text-pnw-gold fill-pnw-gold": analysisData.isAllAnalyzed })}
					icon={<RegularStarFill className="opacity-60" style={{ marginBottom: "4px" }} />}
					iconPosition="start" amount={analysisData.allAnalysisMachines.length > 0 ? <>

						${(analysisData.totalPriceInCents / 100).toFixed(2)} consuming {Math.round(analysisData.totalGrams)} Grams
						{!analysisData.isAllAnalyzed && <> (Incomplete)</>}

					</> : <span>Waiting for Analysis</span>} />

				{analysisData.printingMachines.length > 0 && <>
					<div className="rounded-lg" style={{ borderLeftWidth: "2px", borderColor: "#e5e7eb" }} />

					<Figure
						name={"Printing Status"} style={"small"}
						labelClassName="text-pnw-gold"
						icon={<RegularReload className="inline animate-spin fill-pnw-gold" style={{ marginBottom: "4px", animationDuration: "3s" }} />}
						iconPosition="start" amount={<>
							Printing on {analysisData.printingMachines.join(", ")}
						</>} />
				</>}

			</div>

			<hr className="my-4 lg:my-4" />

			<div className="lg:flex gap-6">
				<div className="lg:grow">
					<div className="flex flex-col gap-2 mb-3">

						{(request.isFulfilled || request.comments != null) && <div>
							<div className="text-sm py-2 px-1 text-nowrap">Messages</div>

							<div className="flex flex-col gap-2">
								{request.isFulfilled && <ContainerNotification title={"Request is Fulfilled"}
									description={`${requester.firstName} picked up this request on ${formateDate(request.fulfilledAt!)}`}
									icon={<FaCheck className="fill-pnw-gold inline mr-2 w-3 h-3 mb-0.5" />} />}

								{request.comments != null && <ContainerNotification title={`Comments from ${request.firstName}`} description={request.comments} />}
							</div>

						</div>}

						<div>
							<div className="text-sm py-2 px-1 w-full">
								<span>Manage {request.parts.length} {request.parts.length > 1 ? "Parts" : "Part"}</span>
							</div>

							<div className={`grid 2xl:grid-cols-2 gap-4`}>
								{request.parts.map((part, index) => {
									const printStatus = machineData?.machines == null ? null : machineData.machines!.find(m => {
										return m.filename == null ? false : m.filename.toLowerCase().includes(part.model.name.toLowerCase());
									});

									return <div className="h-fit">
										<PartEditor
											request={request}
											part={part}
											index={index}
											isQuoted={_hasQuote}
											filaments={availableFilaments}
											count={request.parts.length}
											processingMachine={printStatus} />
									</div>
								})}
								{request.parts.length == 1 && <div className="bg-white out opacity-50 h-full max-2xl:hidden"></div>}
							</div>
						</div>
					</div>
				</div>
				<div className="w-full lg:w-1/3 xl:w-2/6" >
					<div className="text-sm py-2 pt-2 px-1 w-full">{isPaid(request) ? "Receipt" : "Invoice"}</div>
					<div className="bg-white out p-6">
						<MaintainerQuote request={request} requester={requester} />
					</div>

					<div className="text-sm py-2 pt-4 px-1 w-full">
						User Information
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

						<p className="text-sm my-2">Account Balance: ${requester.balanceInDollars.toFixed(2)}</p>

						<DropdownSection name={"Email Performance"} className="px-0 text-sm mt-4" hidden={true}>
							<table className="bg-background px-1 py-2 w-full mt-3 out">
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

function MaintainerQuote({ request, requester }: { request: RequestWithParts, requester: Account }) {
	const [fees, setFees] = useState(0);

	const calculatedData = useMemo(() => {
		const costs = hasQuote(request) ? getCosts(request.quote!) : isAllPriced(request) ? calculateTotalCost(request, fees) : undefined;
		const leadTime = getLeadTimeInDays(request.parts.map(p => p.filament!.leadTimeInDays));
		const hasEnoughBalance = costs != null ? requester.balanceInDollars >= costs.totalCost : undefined;

		return { costs, leadTime, hasEnoughBalance };
	}, [request, requester, fees]);

	return <>

		{/* Display the totals and buttons to manage the invoice/quote */}
		<div>
			{/* <hr className="my-4 mt-6" /> */}
			{isAllPriced(request) && <>

				<div className="flex justify-between gap-5">
					<RequestTotals costs={calculatedData.costs!} onFeesUpdate={(amount) => setFees(amount)} />
				</div>

				<hr className="mb-4" />

				{!isPaid(request) && <p className="my-2 font-light text-sm mb-4">
					<RegularWallet className="inline mr-1 mb-0.5"></RegularWallet>
					{requester.firstName} {calculatedData.hasEnoughBalance ? "has" : "does not have"} enough balance in their account.
				</p>}

				<DropdownSection className="text-sm font-light" name={`Itemized ${isPaid(request) ? "Receipt" : "Invoice"}`} hidden={true}>
					{/* Show the itemized costs of each part even if not priced yet */}
					<ItemizedPartTable parts={request.parts} />

					{hasQuote(request) && <div className="mt-4">
						<DownloadItemizedReceipt request={request} />
					</div>}

				</DropdownSection>

			</>}


			{isAllPriced(request) && !hasQuote(request) && <>
				<RequestSubmitQuoteForm request={request} costs={calculatedData.costs!} />
			</>}
			{!isAllPriced(request) && <button disabled={true} className="text-sm text-left mb-0">
				Not all parts have not been assigned a cost!
			</button>}

			{hasQuote(request) && (isPaid(request) ? <AlreadyPaidButton request={request} /> : <WaitingForPaymentButton request={request} />)}
		</div>
	</>
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

function WaitingForPaymentButton({ request }: { request: Request }) {
	return (
		<button
			className="mb-0 shadow-md text-left text-sm w-full"
			disabled>
			<RegularTimer className="fill-white inline mb-1 mr-1" />
			Waiting for Payment
			<p className="text-white font-light text-sm">
				{`${request.firstName} needs to accept this invoice.`}
			</p>
		</button>
	);
}

function RequestSubmitQuoteForm({ request, costs }: { request: RequestWithParts, costs: ReturnType<typeof calculateTotalCost> }) {

	const { addForm } = useContext(FloatingFormContext);

	const onSubmit = useCallback(() => {
		addForm({
			title: `Submit Quote for \$${costs.totalCost.toFixed(2)}`,
			description: "This quote wil lbe sent to the person and they will need to accept it!",
			submitName: "Submit Quote",
			questions: [
				{
					type: "date",
					id: "estimated-completion-date",
					name: "Estimated Completion Date",
					required: true
				}
			],
			onSubmit: async (data) => {
				data.set("requestId", request.id as any);
				data.set("cost_fees", costs.fees as any);
				const result = await setQuote(undefined, data);
				if (!result.success) return result.errorMessage!;

				return null;
			}
		});
	}, [request, costs]);

	return <>
		<button className="text-sm text-left mb-0" onClick={() => onSubmit()}>
			Submit Quote for ${costs.totalCost.toFixed(2)}
			<p className="text-white font-light text-xs pt-1">
				{`${request.firstName} ${request.lastName} will receive the quote via Email.`}
				<FormLoadingSpinner className="fill-white ml-2" />
			</p>
		</button>
	</>
}