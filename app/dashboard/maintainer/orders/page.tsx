"use server";

import { RequestServe } from "@/app/Types/Request/RequestServe";
import Link from "next/link";
import { RegularEnter } from "lineicons-react";
import StatusPill from "@/app/components/StatusPill";
import {
	getRequestStatus,
	getRequestStatusColor
} from "@/app/Types/Request/Request";

export default async function Maintainer({ params }: { params: any }) {
	const requests = await RequestServe.fetchAll();

	return (
		<>
			<h1 className="text-3xl tracking-wide font-light my-4">
				Manage Orders
			</h1>

			{requests.length == 0 ? (
				<div className="p-4 lg:p-6 shadow-sm rounded-md bg-white outline outline-1 outline-gray-300">
					You do not have any ongoing orders!
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{requests.map((request) => {
						return (
							<div className="shadow-sm rounded-md bg-white outline outline-1 outline-gray-300">
								<div className="flex flex-row justify-between w-full">
									<div className="lg:flex items-center justify-between p-4 lg:p-6 w-full">
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
												{request.name} by{" "}
												{request.firstName}{" "}
												{request.lastName}
											</p>
										</div>
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
									<Link
										href={`/dashboard/maintainer/orders/${request.id}`}
										className="bg-pnw-gold flex justify-center align-middle px-6 py-2 rounded-r-md">
										<RegularEnter className="fill-cool-black w-10 h-auto"></RegularEnter>
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}
