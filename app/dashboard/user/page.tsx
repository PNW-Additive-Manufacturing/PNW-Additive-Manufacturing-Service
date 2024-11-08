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
import RequestsTable from "@/app/components/RequestsTable";

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

			<div
				className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white out`}>
				<p className="pb-4">
					All of your requests are available for you to view right here:
				</p>
				<RequestsTable accountEmail={account.account!.email}></RequestsTable>
			</div>

			{/* <div
				className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white out mt-8`}>
				You do not have any saved or favorites models.
			</div> */}
		</>
	);
}
