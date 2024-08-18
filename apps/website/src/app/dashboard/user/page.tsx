import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { redirect } from "next/navigation";
import { RegularEnter } from "lineicons-react";
import Link from "next/link";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import StatusPill from "@/app/components/StatusPill";
import {
	getLastRefundDate,
	getRequestStatus,
	getRequestStatusColor,
	isRefundAvailable
} from "@/app/Types/Request/Request";
import UserRequestStatusAlert from "@/app/components/Request/UserStatusAlert";
import { formateDate } from "@/app/api/util/Constants";

export default async function Page() {
	let email: string;
	try {
		let payload = (await getJwtPayload())!;
		email = payload.email;
	} catch (e) {
		return redirect("/user/login");
	}

	const requests = await RequestServe.fetchAllByAccount(email);

	return (
		<>
			<h1 className="text-3xl tracking-wide font-light">Your Orders</h1>
			<br />

			<div className="py-2 pr-2 w-full">Ongoing</div>
			{requests.length == 0 ? (
				<div className="p-4 lg:p-6 shadow-sm rounded-md bg-white outline outline-1 outline-gray-300">
					You do not have any ongoing orders!
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{requests.map((request) => {
						return (
							<>
								<div className="shadow-sm rounded-md bg-white outline outline-2 outline-gray-200">
									<div className="flex flex-row justify-between w-full">
										<div className="lg:flex items-start justify-between p-4 lg:p-6 w-full">
											<div>
												<div className="lg:flex items-center">
													<div className="inline-block">
														<StatusPill
															statusColor={getRequestStatusColor(
																request
															)}
															context={getRequestStatus(
																request
															)}></StatusPill>
													</div>
													<p className="text-lg">
														{request.name}
													</p>
													{/* <div className="mt-2">
														<UserRequestStatusAlert
															request={request}
														/>
													</div> */}
												</div>
												<div className="max-lg:hidden text-sm">
													{isRefundAvailable(
														request
													) && (
														<p className="mt-1">
															Eligible to return
															or replace items
															until{" "}
															{formateDate(
																getLastRefundDate(
																	request
																)
															)}
														</p>
													)}
												</div>
											</div>
											<div className="lg:text-right text-sm lg:p-2">
												<div className="text-sm">
													On{" "}
													{request.submitTime.toLocaleDateString(
														"en-us",
														{
															weekday: "long",
															month: "short",
															day: "numeric"
														}
													)}
												</div>
											</div>
										</div>
										<Link
											href={`/dashboard/user/${request.id}`}
											className="bg-blue-500 flex justify-center align-middle px-6 py-2 rounded-r-md">
											<RegularEnter className="fill-white w-10 h-auto"></RegularEnter>
										</Link>
									</div>
								</div>
							</>
						);
					})}
				</div>
			)}
		</>
	);
}
