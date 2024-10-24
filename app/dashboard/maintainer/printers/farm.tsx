"use client";

import FarmUploadForm from "@/app/components/FarmUploadForm";
import Machine, { MachineData } from "@/app/components/Machine";
import Filament from "@/app/Types/Filament/Filament";
import { RegularSpinnerSolid } from "lineicons-react";
import { useEffect, useState } from "react";
import { useEffectOnce } from "react-use";

export default function Farm({
	availableFilaments
}: {
	availableFilaments: Filament[];
}) {
	const [machines, setMachines] = useState<{
		machines: MachineData[] | null;
		lastUpdated: number;
	}>({ lastUpdated: Date.now(), machines: null });
	const [isLoading, setLoading] = useState(false);

	async function updateMachines() {
		setLoading(true);

		await new Promise((res) => setTimeout(res, 500));

		try {
			const fetchedData = await (
				await fetch("/api/farm/printers", { cache: "no-cache" })
			).json();

			console.log("Fetched", fetchedData);

			if (!fetchedData.success) {
				throw new Error("Response not marked as succeeded!");
			}

			delete fetchedData.success;

			setMachines({
				machines: Object.values(fetchedData) as MachineData[],
				lastUpdated: Date.now()
			});
		} catch (ex) {
			console.error("Unable to fetch Farm!", ex);
		}

		setLoading(false);
	}

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isLoading) {
				updateMachines();
			}
		}, 10000);

		//Clearing the interval
		return () => clearInterval(interval);
	});

	useEffect(() => {
		if (machines?.machines == null && !isLoading) {
			updateMachines();
		}
	}, []);

	let isOutOfDate = machines.lastUpdated + 15000 < Date.now();

	return (
		<>
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-light my-4">Farm Management</h2>
					<div className="flex items-center gap-1 pt-0.5">
						<div
							className={`w-3.5 h-3.5 border-2 border-gray-200 rounded-full ${isOutOfDate ? "bg-red-500" : "bg-pnw-gold"
								}`}
						/>
						<span
							className={
								isOutOfDate ? "text-red-500" : "text-pnw-gold"
							}>
							{isOutOfDate ? "Disconnected" : "Live"}
						</span>
					</div>
				</div>

				<div className="flex h-fit gap-4 items-center">
					{machines.machines && (
						<div>
							{Math.round(
								(machines.machines.filter(
									(m) => m.status == "Printing"
								).length /
									machines.machines.length) *
								100
							)}
							% Utilization
						</div>
					)}

					{machines.machines && (
						<p>{machines.machines.length ?? 0} Printers</p>
					)}
					<div
						className={`flex items-center hover:text-pnw-gold hover:fill-pnw-gold fill-black hover:cursor-pointer ${isLoading && "fill-pnw-gold text-pnw-gold"
							}`}
						onClick={async () => await updateMachines()}>
						Reload
						<RegularSpinnerSolid
							className={`fill-inherit w-auto h-auto inline ml-2 ${isLoading && "animate-spin"
								}`}></RegularSpinnerSolid>
					</div>
				</div>
			</div>

			{machines.machines == null ? (
				<>Not loaded!</>
			) : (
				<>
					<div className="flex gap-6">
						<div className="w-full grid grid-cols-3 row-auto gap-4 gap-y-4 h-fit">
							{machines.machines.map((p) => (
								<Machine
									{...p}
									onUpdate={() => updateMachines()}></Machine>
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
