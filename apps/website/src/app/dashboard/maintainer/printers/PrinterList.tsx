"use client";

import { useState, useTransition } from "react";
import { deletePrinter } from "@/app/api/server-actions/printer";
import DropdownSection from "@/app/components/DropdownSection";
import { PrinterForm } from "./PrinterForm";
import EditPrinter from "./EditPrinterModalForm";

export interface Printer {
	name: string;
	model: string;
	supportedMaterials: string[];
	dimensions: number[];
	communicationstrategy: string | null;
	communicationoptions?: string;
}

export function PrinterList({
	initialPrinters,
	filamentMaterials,
}: {
	initialPrinters: Printer[];
	filamentMaterials: string[];
}) {
	var [printers, setPrinters] = useState(initialPrinters);
	var [pending, startTransition] = useTransition();
	var [error, setError] = useState("");

	let [printerBeingEdited, setPrinterBeingEdited] = useState("");

	let deletePrinterClick = (printerName: string) => {
		startTransition(async () => {
			let form = new FormData();
			form.append("printer-name", printerName);
			let errorMessage = await deletePrinter(error, form);
			if (errorMessage) {
				setError(errorMessage);
				return;
			}

			setPrinters(printers.filter((p) => p.name !== printerName));
		});
	};

	let editPrinterClick = (printerName: string) => {
		setPrinterBeingEdited(printerName);
	};

	let addPrinterCallback = (p: Printer | null) => {
		if (p === null) {
			setPrinterBeingEdited("");
			return;
		}

		let newList = printers.slice();
		newList.push(p);
		setPrinters(newList);

		window.scrollTo({
			top: 0,

			behavior: "smooth",
		});
	};

	let doneEditingCallback = (printer: Printer | null) => {
		setPrinterBeingEdited("");

		if (printer === null) {
			return;
		}
		//update printer table UI with new values for printer
		let newList = printers.slice();
		let editedPrinterIndex = newList.findIndex(
			(p) => p.name === printer.name,
		);

		//did not find edited printer somehow, ignore the edit
		if (editedPrinterIndex === -1) {
			return;
		}

		newList[editedPrinterIndex] = printer;
		setPrinters(newList);
	};

	return (
		<>
			{printerBeingEdited ? (
				<EditPrinter
					doneEditingCallback={doneEditingCallback}
					filamentOptions={filamentMaterials}
					printer={
						printers.find((p) => p.name === printerBeingEdited)!
					}></EditPrinter>
			) : (
				<></>
			)}
			<div>
				<DropdownSection name="Printers" collapsible={true}>
					<p className="text-red-600">{error}</p>
					<table className="bg-white w-full">
						<thead>
							<tr className="text-gray-400">
								<th className="text-left pl-5">Name</th>
								<th className="text-left">Model</th>
								<th className="text-left">Materials</th>
								<th className="text-left">Dimensions in mm</th>
								<th className="text-left">
									Communication Strategy
								</th>
								<th className="text-left pr-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{printers.map((p: Printer) => (
								<tr id={p.name} key={p.name}>
									<td className="text-left pl-5">{p.name}</td>
									<td className="text-left">{p.model}</td>
									<td className="text-left">
										{p.supportedMaterials.join(",")}
									</td>
									<td className="text-left">
										{p.dimensions[0]} x {p.dimensions[1]} x{" "}
										{p.dimensions[2]}
									</td>
									<td className="text-left">
										{p.communicationstrategy}
									</td>
									<td className="text-left pr-2">
										<button
											className="bg-red-500 p-1 rounded-lg border-none"
											onClick={(e) =>
												deletePrinterClick(p.name)
											}>
											Delete
										</button>
										<button
											className="bg-green-500 p-1 rounded-lg border-none"
											onClick={(e) =>
												editPrinterClick(p.name)
											}>
											Edit
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</DropdownSection>

				<DropdownSection
					hidden={true}
					name="Configure new Printer"
					className="mt-8">
					<PrinterForm
						addPrinterCallback={addPrinterCallback}
						filamentOptions={filamentMaterials}
					/>
				</DropdownSection>
			</div>
		</>
	);
}
