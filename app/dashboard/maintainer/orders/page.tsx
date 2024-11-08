"use server";

import { RequestServe } from "@/app/Types/Request/RequestServe";
import Link from "next/link";
import { RegularEnter } from "lineicons-react";
import StatusPill from "@/app/components/StatusPill";
import {
	getRequestStatus,
	getRequestStatusColor
} from "@/app/Types/Request/Request";
import RequestsTable from "@/app/components/RequestsTable";

export default async function Maintainer({ params }: { params: any }) {
	return (
		<>
			<h1 className="text-2xl tracking-wide font-light">
				Request Management
			</h1>

			<br />

			<div
				className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white out`}>
				<RequestsTable></RequestsTable>
			</div>
		</>
	);
}
