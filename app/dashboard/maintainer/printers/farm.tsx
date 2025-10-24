"use client";

import FarmUploadForm from "@/app/components/FarmUploadForm";
import Machine, { MachineData } from "@/app/components/Machine";
import usePrinters from "@/app/hooks/usePrinters";
import Filament from "@/app/Types/Filament/Filament";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useEffectOnce } from "react-use";

export default function Farm({
	availableFilaments
}: {
	availableFilaments: Filament[];
}) {
	const { machines, lastFetched, failedReason, refresh, isFetching } = usePrinters(true);

	let isOutOfDate = lastFetched == null || lastFetched.getTime() + 15000 < Date.now();

	return (
		<>
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					<h2 className="text-xl font-light">Farm Management</h2>
					<div className="flex items-center gap-1">
						<div className={`w-3.5 h-3.5 border-2 border-gray-200 rounded-full ${isOutOfDate ? "bg-red-500" : "bg-pnw-gold"}`} />
						<span
							className={
								isOutOfDate ? "text-red-500" : "text-pnw-gold"
							}>
							{isOutOfDate ? "Disconnected" : "Live"}
						</span>
					</div>
				</div>

				<div className="flex h-fit gap-4 items-center">
					{machines && (
						<div>
							{Math.round(
								(machines.filter(
									(m) => m.status === "Printing"
								).length /
									machines.length) *
								100
							)}
							% Utilization
						</div>
					)}

					{machines && (
						<p>{machines.length ?? 0} Printers</p>
					)}
					<div
						className={`flex items-center hover:text-pnw-gold hover:fill-pnw-gold fill-black hover:cursor-pointer ${isFetching && "fill-pnw-gold text-pnw-gold"
							}`}
						onClick={async () => await refresh()}>
						Reload
						<FontAwesomeIcon
							icon={faSpinner}
							className={`fill-inherit w-auto h-auto inline ml-2 ${isFetching && "animate-spin"
								}`}/>
					</div>
				</div>
			</div>

			<br />

			{machines == null ? (
				<>Not loaded!</>
			) : (
				<>
					<div className="flex gap-6">
						<div className="w-full grid lg:grid-cols-3 row-auto gap-4 gap-y-4 h-fit">
							{machines.map((p) => (
								<Machine
									{...p}
									onUpdate={() => refresh()}></Machine>
							))}
						</div>

						{/* <div style={{ width: "450px" }}>
							<FarmUploadForm
								machines={machines.machines}
								availableFilaments={
									availableFilaments
								}></FarmUploadForm>
						</div> */}
					</div>
				</>
			)}
		</>
	);
}
