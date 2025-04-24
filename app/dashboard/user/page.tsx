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
import ThreeModelViewer from "@/app/components/ThreeModelViewer";
import Link from "next/link";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { redirect } from "next/navigation";
import RequestsTable from "@/app/components/RequestsTable";
import { GridGallery } from "../../components/GridGallery";

const requestsPerPage = 10;

export default function Page() {
	var account = useContext(AccountContext);

	if (!account.isSingedIn) redirect("/user/login");

	return (
		<>
			<h1 className="text-2xl tracking-wide font-light">
				Your Requests
			</h1>

			<br />
			<p className="pb-4">
				All of your requests are available for you to view right here:
			</p>

			{/* <div className={`rounded-sm bg-white out p-4 lg:p-6`}> */}

			{/* <div className="p-4 lg:p-6">

					<div className="flex gap-6">
						<div className="w-40 h-40 p-2 bg-background rounded-md">
							<GridGallery imageSources={["/assets/plate_1.png", "/assets/plate_1.png"]} />
						</div>
						<div>
							<h2 className="text-xl font-medium">2025 Runners FSAE</h2>
							<p>Status</p>
							<div className="bg-blue-400 bg-opacity-25 text-black p-2">Quoted</div>
						</div>
					</div>
				</div> */}

			{/* <div className="bg-gray-200 py-3 px-4 lg:px-6 text-sm rounded-t-sm">
					Order Placed on 4/23/2025
				</div> */}
			<RequestsTable accountEmail={account.account!.email}></RequestsTable>
			{/* </div> */}

			{/* <div
				className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white out mt-8`}>
				You do not have any saved or favorites models.
			</div> */}
		</>
	);
}
