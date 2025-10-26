"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FaSpinner } from "react-icons/fa";
import Filament from "../Types/Filament/Filament";
import { MachineData } from "./Machine";
import Slicer from "./Slicer";

function UploadButton({
	disabled,
	content
}: {
	disabled?: boolean;
	content: string;
}) {
	disabled = disabled ?? false;

	const { pending, data, method, action } = useFormStatus();

	return (
		<button
			disabled={disabled || pending}
			className="mt-4 flex gap-4 items-center">
			{pending ? "Processing" : content}
			{pending && (
				<FaSpinner className="fill-white w-auto h-auto animate-spin"></FaSpinner>
			)}
		</button>
	);
}

export default function FarmUploadForm({
	availableFilaments,
	machines
}: {
	availableFilaments: Filament[];
	machines: MachineData[];
}) {
	const [file, setFile] = useState<File | undefined>(undefined);

	const [machinesWithFilament, setMachinesWithFilament] = useState<
		MachineData[] | undefined
	>(undefined);

	return (
		<div style={{ width: "450px" }}>
			{file == null && (
				<div className="bg-white min-h-96 flex justify-center items-center outline outline-2 outline-gray-200">
					<input
						className="bg-white outline-none border-none w-fit"
						hidden={file != null}
						type="file"
						name="file"
						id="file"
						required
						onChange={(ev) =>
							setFile(ev.target.files!.item(0)!)
						}></input>
				</div>
			)}

			{file && (
				<Slicer
					onUpload={() => console.log("To be uploaded!")}
					filaments={availableFilaments}
					modelFile={file}></Slicer>
			)}
		</div>
	);
}
