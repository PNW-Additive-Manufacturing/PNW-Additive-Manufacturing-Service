"use client";

import {
	getRequestStatus,
	getRequestStatusColor,
	hasQuote,
	isAnyPartDenied,
	RequestWithParts
} from "@/app/Types/Request/Request";
import Table from "@/app/components/Table";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "@/app/ContextProviders";
import { APIData } from "@/app/api/APIResponse";
import { Input, InputCheckbox } from "@/app/components/Input";
import DropdownSection from "@/app/components/DropdownSection";
import {
	RegularArrowLeft,
	RegularArrowRight,
	RegularExit,
	RegularMagnifier,
	RegularSpinnerSolid
} from "lineicons-react";
import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import { formateDate } from "@/app/api/util/Constants";
import Timeline from "@/app/components/Timeline";
import ModelViewer from "@/app/components/ModelViewer";
import Link from "next/link";
import RequestPricing from "@/app/components/Request/Pricing";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { redirect } from "next/navigation";

const requestsPerPage = 10;

export default function Page() {
	var account = useContext(AccountContext);

	if (!account.isSingedIn) redirect("/user/login");

	const [isFetchingRequests, setIsFetchingRequests] = useState(false);
	const [includeFulfilled, setIncludeFulfilled] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [requests, setRequests] = useState<RequestWithParts[]>();
	const [selectedRequest, setSelectedRequest] = useState<number>();

	function fetchRequests() {
		setIsFetchingRequests(true);

		fetch("/api/requests", {
			method: "POST",
			body: JSON.stringify({
				accountEmail: account.account!.email,
				requestedAfter: undefined,
				includeFulfilled: includeFulfilled,
				requestsPerPage: requestsPerPage,
				page: pageNum
			})
		})
			.then((res) => res.json())
			.then((data: APIData<{ requests?: RequestWithParts[] }>) => {
				if (!data.success) throw new Error(data.errorMessage);
				data.requests!.forEach((r) => {
					r.submitTime = new Date(r.submitTime);
					if (hasQuote(r))
						r.quote!.paidAt = new Date(r.quote!.paidAt);
				});
				setRequests(data.requests);
			})
			.catch((err) => console.error(err))
			.finally(() => setIsFetchingRequests(false));
	}

	useEffect(() => fetchRequests(), [pageNum, includeFulfilled]);

	return (
		<>
			<h1 className="text-3xl tracking-wide font-light">
				Welcome, {account.account!.firstName}{" "}
				{account.account!.lastName}!
			</h1>

			<br />

			{requests == null ? (
				<div className="flex gap-2 items-center p-4 lg:p-6 shadow-sm rounded-md bg-white outline outline-1 outline-gray-300">
					Fetching Requests
				</div>
			) : requests.length == 0 ? (
				<div className="p-4 lg:p-6 shadow-sm rounded-md bg-white outline outline-1 outline-gray-300">
					You do not have any ongoing orders!
				</div>
			) : (
				<div
					className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white outline outline-2 outline-gray-200`}>
					<p className="pb-4">
						All of your requests are available for you to view right here.
					</p>
					<Table>
						<tbody>
							{requests.map((r) => (
								<>
									<tr
										onClick={() => setSelectedRequest(r.id)}
										// className={`w-full border-l-4 border-solid ${selectedRequest == r.id && "outline-2 outline-dashed outline-pnw-gold "}`}
										className={`w-full border-l-4`}
										style={{
											borderLeftColor:
												getRequestStatusColor(r)
										}}>
										<td className="max-lg:hidden">
											{r.submitTime.toLocaleDateString(
												"en-us",
												{
													weekday: "long",
													month: "short",
													day: "numeric",
													year: "numeric"
												}
											)}
										</td>
										<td>{r.name}</td>
										<td
											style={{
												color: getRequestStatusColor(r)
											}}>
											{getRequestStatus(r)}
										</td>
										<td>
											{hasQuote(r) &&
												`$${(
													r.quote!.totalPriceInCents /
													100
												).toFixed(2)}`}
										</td>
										<td>
											<div className="ml-auto w-fit">
												<Link
													href={`/dashboard/user/${r.id}`}>
													<button className="shadow-sm w-fit mb-0 outline outline-1 outline-gray-300 bg-white text-black fill-black flex flex-row gap-2 justify-end items-center px-3 py-2">
														<span className="text-sm">
															View Request
														</span>
														<RegularMagnifier></RegularMagnifier>
													</button>
												</Link>
											</div>
										</td>
									</tr>
									{/* {selectedRequest == r.id && <tr className={`w-full border-l-4 border-l-${getRequestStatusColor(
											r
										)}`}>
											<td>
												<Timeline
													options={[
														{
															title: "Requested",
															description: (
																<>
																	Submitted on{" "}
																	{formateDate(r.submitTime)}.
																</>
															),
															disabled: false
														},
														{
															title: "Quoted",
															description: (
																<>
																	{r.quote?.paidAt == undefined
																		? "Payment is pending."
																		: `Paid on ${formateDate(r.quote?.paidAt)}.`}
																</>
															),
															disabled: !hasQuote(r)
														},
														{
															title: "Processing",
															description: (
																<>Your parts are being printed!</>
															),
															disabled: isAllPending(r.parts)
														},
														{
															title: "Ready for Pick up",
															description: (
																<>
																	Pick up at the{" "}
																	<a
																		href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7"
																		className="underline">
																		Design Studio
																	</a>
																	.
																</>
															),
															disabled: !isAllComplete(r.parts)
														},
														{
															title: "Fulfilled",
															// description: `On ${formateDate(
															// 	request.fulfilledAt!
															// )}`,
															disabled: !r.isFulfilled
														}
													]}
												/>
											</td>
											<td className="block w-88">
												{hasQuote(r) && <RequestPricing request={r}></RequestPricing>}
											</td>
											<td />
											<td />
										</tr >} */}
								</>
							))}
						</tbody>
					</Table>
					{/* Controls */}
					<div className="flex max-lg:gap-4 max-lg:flex-col justify-between lg:px-4 lg:pr-8 py-4">
						<div className="flex gap-6 items-center">
							<div className="flex justify-between gap-2 fill-white">
								<button
									className="mb-0 shadow-sm"
									disabled={isFetchingRequests || pageNum < 2}
									onClick={() => setPageNum(pageNum - 1)}>
									<RegularArrowLeft></RegularArrowLeft>
								</button>
								<button
									className="mb-0 shadow-sm"
									disabled={
										isFetchingRequests ||
										requests.length < requestsPerPage
									}
									onClick={() => setPageNum(pageNum + 1)}>
									<RegularArrowRight></RegularArrowRight>
								</button>
							</div>
							<p>
								Viewing {requests.length} results on Page{" "}
								{pageNum}
							</p>
						</div>
						<div className="flex gap-4">
							{isFetchingRequests && (
								<RegularSpinnerSolid
									className={`inline-block h-auto w-auto animate-spin fill-black`}
								/>
							)}
							<InputCheckbox
								label={"Include Fulfilled"}
								id={"includeFulfilled"}
								defaultChecked={false}
								onChange={(v) =>
									setIncludeFulfilled(v.currentTarget.checked)
								}></InputCheckbox>
							{/* <Input label={"Purchased"} type={"date"} id={"placedAfter"}></Input> */}
						</div>
					</div>
				</div>
			)}

			<div
				className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white outline outline-2 outline-gray-200 mt-8`}>
				You do not have any saved or favorites models.
			</div>
		</>
	);
}
