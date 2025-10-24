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

import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import { formateDate } from "@/app/api/util/Constants";
import Timeline from "@/app/components/Timeline";
import ThreeModelViewer from "@/app/components/ThreeModelViewer";
import Link from "next/link";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { redirect } from "next/navigation";
import RequestsTable from "@/app/components/RequestsTable";
import { GridGallery } from "../../components/GridGallery";
import HorizontalWrap from "@/app/components/HorizontalWrap";

export default function Page() {
	const account = useContext(AccountContext);

	if (!account.isSingedIn) redirect("/user/login");

	return (
		<>
			<HorizontalWrap className="py-8 flex flex-col gap-4">
				<h1 className="w-fit text-3xl font-normal">
					Your Requests
				</h1>
				<p>
					All of your requests are available for you to view right here:
				</p>
			</HorizontalWrap>

			<div className="bg-white min-h-screen">
				<HorizontalWrap className="py-8">

					<RequestsTable accountEmail={account.account!.email} requestsPerPage={5} />


				</HorizontalWrap>

			</div>
		</>
	);
}
