"use client";

import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { SupportedFilaments } from "./SupportedFilaments";
import { useState } from "react";
import { Printer } from "./PrinterList";
import { addPrinter, updatePrinter } from "@/app/api/server-actions/printer";

//Note that printerPreFill is used to EDIT a printer, while omitting it allows this form to ADD a printer
export function PrinterForm({
	addPrinterCallback,
	filamentOptions,
	printerPreFill,
}: {
	addPrinterCallback: (p: Printer | null) => void;
	filamentOptions: string[];
	printerPreFill?: Printer;
}) {
	let [nameField, setNameField] = useState(printerPreFill?.name ?? "");
	let [modelField, setModelField] = useState(printerPreFill?.model ?? "");
	let [dimensionField1, setDimensionField1] = useState(
		printerPreFill?.dimensions[0] ?? "",
	);
	let [dimensionField2, setDimensionField2] = useState(
		printerPreFill?.dimensions[1] ?? "",
	);
	let [dimensionField3, setDimensionField3] = useState(
		printerPreFill?.dimensions[2] ?? "",
	);

	let [materials, setMaterials] = useState(
		printerPreFill?.supportedMaterials ?? ([] as string[]),
	);
	let [selectedMaterial, setSelectedMaterial] = useState("");

	let [stratField, setStratField] = useState(
		printerPreFill?.communicationstrategy ?? "",
	);
	let [optionsField, setOptionsField] = useState(
		printerPreFill?.communicationoptions ?? "",
	);

	let addPrinterAction = async (prevState: string, formData: FormData) => {
		let result;
		if (!printerPreFill) {
			result = await addPrinter(prevState, formData);
		} else {
			result = await updatePrinter(
				prevState,
				formData,
				printerPreFill?.name,
			);
		}

		if (result.error) {
			return result.error;
		}

		setDimensionField1("");
		setDimensionField2("");
		setDimensionField3("");

		setModelField("");
		setNameField("");
		setStratField("");
		setOptionsField("");

		setMaterials([]);
		setSelectedMaterial("");

		addPrinterCallback(result.printer!);

		return "";
	};

	return (
		<div>
			{printerPreFill ? (
				<button
					className="float-right p-4 font-bold text-lg"
					onClick={(e) => addPrinterCallback(null)}>
					&times;
				</button>
			) : (
				<></>
			)}
			<GenericFormServerAction
				serverAction={addPrinterAction}
				submitName={printerPreFill ? "Edit Printer" : "Add Printer"}
				submitPendingName={
					printerPreFill ? "Editing Printer..." : "Adding Printer..."
				}>
				<Input
					label="Printer Name"
					name="printer-name"
					type="text"
					id="printer-name"
					placeholder="ex: Printer 1"
					value={nameField}
					onChange={(e) => setNameField(e.target.value)}
				/>
				<Input
					label="Printer Model"
					name="printer-model"
					type="text"
					id="printer-model"
					placeholder="ex: Creality Ender 3"
					value={modelField}
					onChange={(e) => setModelField(e.target.value)}
				/>
				<div className="font-semibold">
					<p className="uppercase br-2">Dimensions in mm</p>
					<span>
						<input
							className="w-40 inline-block"
							type="number"
							name="printer-dimension1"
							placeholder="x"
							value={dimensionField1}
							onChange={(e) => setDimensionField1(e.target.value)}
						/>
						<input
							className="w-40 inline-block"
							type="number"
							name="printer-dimension2"
							placeholder="y"
							value={dimensionField2}
							onChange={(e) => setDimensionField2(e.target.value)}
						/>
						<input
							className="w-40 inline-block"
							type="number"
							name="printer-dimension3"
							placeholder="z"
							value={dimensionField3}
							onChange={(e) => setDimensionField3(e.target.value)}
						/>
					</span>
				</div>
				<p className="font-semibold w-full p-2 br-2 mb-2">
					Supported Filament Materials
				</p>
				<SupportedFilaments
					currentMaterials={materials}
					setMaterialCallback={setMaterials}
					filamentOptions={filamentOptions}
					selectedFilament={selectedMaterial}
					setSelectedFilament={setSelectedMaterial}
				/>

				<Input
					label="Communication Strategy"
					name="printer-communication"
					type="text"
					id="printer-communication"
					placeholder="MoonRaker, Serial, or Bambu"
					value={stratField}
					onChange={(e) => setStratField(e.target.value)}
				/>
				<Input
					label="Communication Strategy Options"
					name="printer-communication-options"
					type="text"
					id="printer-communication-options"
					placeholder="Host, Extruder Count, Has Heated Bed"
					value={optionsField}
					onChange={(e) => setOptionsField(e.target.value)}
				/>
			</GenericFormServerAction>
		</div>
	);
}
