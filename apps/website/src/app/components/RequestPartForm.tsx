"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Input, InputBig } from '@/app/components/Input';
import { requestPart } from "@/app/api/server-actions/request-part";
import DropdownSection from "./DropdownSection";
import { Filament } from "../dashboard/maintainer/filaments/FilamentTable";
import { FilamentSelector } from "./FilamentSelector";
import { ChangeEventHandler, LegacyRef, Ref, useRef, useState } from "react";
import { RegularAddFiles, RegularEmptyFile, RegularQuestionCircle, RegularPencil, RegularTrashCan } from 'lineicons-react';
import QuantityInput from "./QuantityInput";
import Table from "./Table";
import { Dialog, Tab } from "@headlessui/react";

function AddPartButton({ onChange }: { onChange: ChangeEventHandler<HTMLInputElement> }) {
	var inputRef = useRef<LegacyRef<HTMLInputElement>>();

	return <>
		<input className='hidden' ref={inputRef as any} hidden type="file" accept=".stl" multiple={true} onChange={ev => {
			ev.preventDefault();
			onChange(ev);
			ev.currentTarget.value = '';
		}} />
		<button className="w-full px-4 py-2 mb-0 text-sm h-full" onClick={ev => {
			ev.preventDefault();
			(inputRef.current?.valueOf() as HTMLInputElement).click();
		}}>
			<RegularAddFiles className="inline mr-2 w-4 h-4 fill-white"></RegularAddFiles>
			Add More Files
		</button>
	</>
}

interface PartData {
	File: File;
	ModelName: string;
	Quantity: number;
	Material: string;
	Color: string;
}

//TODO: Make this work for more generic forms
export function RequestPartForm({ filaments, children }: { filaments: Filament[], children?: any }): JSX.Element {
	let [error, formAction] = useFormState<string, FormData>(requestPart, "");
	let { pending } = useFormStatus();

	let [parts, setParts] = useState<PartData[]>([]);
	let [modifyingPart, setModifyingPart] = useState<PartData>();

	return <>
		<Dialog open={modifyingPart != null} onClose={() => setModifyingPart(undefined)} className="relative z-50">

			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex w-screen items-center justify-center shadow-lg">
				<Dialog.Panel className="mx-auto max-w-sm rounded-md bg-white p-6">
					<Dialog.Title className="mb-4">
						<RegularEmptyFile className="inline w-5 h-5 fill-gray-500 text-purple-200 mr-2"></RegularEmptyFile>
						{modifyingPart?.ModelName}
					</Dialog.Title>

					<p className="font-semibold p-2 pl-0">Quantity</p>
					<input type="number" min={1} max={80} required defaultValue={modifyingPart?.Quantity ?? 1} onChange={v => {
						modifyingPart!.Quantity = v.currentTarget.valueAsNumber;
						setModifyingPart(modifyingPart);
					}}></input>

					<p className="font-semibold p-2 pl-0">Technology</p>
					<select defaultValue="fdm">
						<option value="fdm">Fused Deposition Modeling (FDM)</option>
					</select>

					<p className="font-semibold p-2 pl-0">Filament</p>
					<FilamentSelector defaultColor={modifyingPart?.Color} defaultMaterial={modifyingPart?.Material} filaments={filaments} onChange={(material, color) => {
						modifyingPart!.Material = material;
						modifyingPart!.Color = color;
						setModifyingPart(modifyingPart);
					}}></FilamentSelector>

					<div className="mt-4">
						<button
							type="button"
							className="inline-flex justify-center rounded-md border border-transparent bg-cool-black text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
							onClick={() => 
							{
								let theseParts = parts;
								let partIndex = theseParts.findIndex(p => modifyingPart!.ModelName == p.ModelName);

								console.log("Updated Part: ", modifyingPart)

								theseParts[partIndex] = modifyingPart!;
								setParts(theseParts);
								setModifyingPart(undefined);
							}}
						>Apply Changes</button>
					</div>

					<button className="bg-red-900" onClick={() => {
						parts.splice(parts.indexOf(modifyingPart!), 1);
						setParts(parts);
						setModifyingPart(undefined);
					}}>Delete</button>

				</Dialog.Panel>
			</div>
		</Dialog>

		<form action={(formData) => {
			for (var part of parts) 
			{
				formData.append("file", part.File);
				formData.append("quantity", part.Quantity.toString());
				formData.append("material", part.Material);
				formData.append("color", part.Color);
			}
			formAction(formData)
		}}>
			<div className="bg-white rounded-sm w-full grid auto-cols-auto auto-rows-auto p-6 gap-6">
				<div className="col-start-3 col-end-3 row-start-1 row-span-2 pt-2">
					<Input label="Request Name" type="text" id="name" name="requestname"
						placeholder={parts.length > 1
							? `${parts[0].ModelName} & ${parts.length - 1} More`
							: parts.length > 0
								? parts[0].ModelName
								: "Enter the name of the request"} />

					<div className="h-full">
						<p className="font-semibold br-2 py-2">Comments</p>
						<InputBig id="notes" name="notes" placeholder="Anything else we should know?" className="bg-white h-full" style={{ height: "calc(100% - 40px)" }} />
					</div>
				</div>

				<div className="col-start-1 col-span-2 row-start-1 row-span-3" style={{minWidth: "300px"}}>
					<p className="font-semibold br-2 py-2">Models</p>

					<div className="overflow-x-auto" style={{ minWidth: "25 rem" }}>
						{parts.length > 0 ? <Table>
							<tbody>
								{parts.map(part => <tr key={part.ModelName} className="bg-transparent h-fit outline-none border-0 block p-4 hover:cursor-pointer" onClick={() => setModifyingPart(part)}>
									<RegularEmptyFile className="inline w-5 h-5 fill-gray-500 text-purple-200 mr-2"></RegularEmptyFile>
									{part.File.name}

									<span className="float-right">{part.Material}, {part.Color} x {part.Quantity}</span>
								</tr>)}
							</tbody>
						</Table> : <p className="w-fit mt-4 text-sm">Upload a model to begin.</p>}
					</div>
				</div>

				<div className="col-start-3 col-span-1 row-start-3 row-span-1">
					<span className="">
						<div className="font-semibold p-2 pl-0">
							<RegularQuestionCircle className="inline w-5 h-5 fill-cool-black text-purple-200 mr-2"></RegularQuestionCircle>
							What is next?
						</div>
						<p className="text-sm" style={{maxWidth: "600px"}}>After submission, your order will be reviewed. You'll receive a quote via email. After payment and printing, pickup parts from the Design Studio on Campus with your ID.</p>
					</span>
				</div>

				<p className="text-sm text-red-500 col-start-3 col-span-1">{error}</p>

				<div className="rounded-sm p-0 w-full col-start-3 col-end-3 row-start-4 row-span-1 h-14">
					<input
						className="font-semibold text-cool-black w-full h-full"
						style={{ color: 'rgb(48 48 48)', backgroundColor: 'hsl(33, 100%, 52.9%)', background: 'linear-gradient(45deg, hsl(33, 100%, 52.9%) 0%, hsl(58.2, 100%, 68%) 100%)', marginBottom: "0px" }}
						disabled={pending || parts.length == 0}
						type="submit"
						value={pending ? "Contacting our Server..." : "Submit Order"} />
				</div>

				<div className="col-start-1 col-span-2 row-start-4 row-span-1 h-14">
					<AddPartButton onChange={ev => {
						ev.preventDefault();

						if (ev.currentTarget.files == null) return;

						var newParts: PartData[] = (Array.from(Array(ev.currentTarget.files.length).keys())).map(i => {
							const f = ev.currentTarget.files![i];
							return {
								File: f,
								ModelName: f.name.substring(0, f.name.lastIndexOf('.')),
								Material: "PLA",
								Color: "White",
								Quantity: 1
							}
						})

						setParts([
							...parts,
							...newParts
						]);
					}}></AddPartButton>
				</div>
			</div>
		</form>
	</>
}