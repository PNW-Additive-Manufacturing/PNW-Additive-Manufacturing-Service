"use client"

import { useFormState, useFormStatus } from "react-dom";
import { Input, InputBig } from '@/app/components/Input';
import { requestPart } from "@/app/api/server-actions/request-part";
import Dropdown from "./Dropdown";
import { Filament } from "../dashboard/maintainer/filaments/FilamentTable";
import { FilamentSelector } from "./FilamentSelector";
import { ChangeEventHandler, LegacyRef, Ref, useRef, useState } from "react";
import { RegularAddFiles, RegularEmptyFile, RegularTrashCan } from 'lineicons-react';
import QuantityInput from "./QuantityInput";

function AddPartButton({onChange}: {onChange: ChangeEventHandler<HTMLInputElement>})
{
	var inputRef = useRef<LegacyRef<HTMLInputElement>>();

	return <>
		<input className='hidden' ref={inputRef as any} hidden type="file" accept=".stl" multiple={true} onChange={ev => {
			ev.preventDefault();
			onChange(ev);
			ev.currentTarget.value = '';
		}}/>
		<button className="w-full px-4 py-2 mb-0 text-sm" onClick={ev => {
			ev.preventDefault();
			(inputRef.current?.valueOf() as HTMLInputElement).click();
		}}>
			<RegularAddFiles className="inline mr-2 w-4 h-4 fill-white"></RegularAddFiles>
			Add More Files
		</button>
	</>
}

interface PartData
{
	File: File;
	ModelName: string;
	Quantity: number;
	FilamentId: number;
}

//TODO: Make this work for more generic forms
export function RequestPartForm({ filaments, children }: { filaments: Filament[], children?: any }): JSX.Element {
	let [error, formAction] = useFormState<string, FormData>(requestPart, "");
	let { pending } = useFormStatus();

	let [parts, updateParts] = useState<PartData[]>([]);

	return (
		<form action={(formData) => {
			for (var part of parts) formData.append("file", part.File);
			formAction(formData)
		}}>
			<div className="bg-white rounded-sm w-full">
				<Input label="Request Name" type="text" id="name" name="requestname" 
					placeholder={parts.length > 1 
								? `${parts[0].ModelName} & ${parts.length - 1} More` 
								: parts.length > 0
								? parts[0].ModelName
								: "Enter the name of the request"} />

				<Dropdown 
					name='Parts' 
					collapsible={false}
					headerBackground='bg-gray-100'
					headerText="text-cool-black text-bold"
				>
					<div className=''>
						<div className="">
							<table className={`w-full ${parts.length > 0 ? 'mb-2' : ''}`}>
								<tbody>
									{parts.map(part => {
										console.log(part);

										return <tr key={part.ModelName} className="bg-gray-100 p-0">
											<td>
												<RegularEmptyFile className="inline w-5 h-5 fill-gray-500 text-purple-200 mr-2"></RegularEmptyFile> 
												{part.File.name}
											</td>
											<td>
												<div className="flex items-center">
													<span className="mr-2 text-gray-600 text-base">Quantity</span>
													<QuantityInput defaultQuantity={part.Quantity} name='quantity' min={1} max={8}></QuantityInput>
												</div>
											</td>
											<td>
												<div className="flex items-center">
													<span className="mr-2 text-gray-600 text-base">Filament</span>
													<div className="bg-white rounded-sm px-2">
														<FilamentSelector
															filaments={filaments}></FilamentSelector>
													</div>
												</div>
											</td>
											<td>
												<RegularTrashCan 
													className="w-5 h-5 mr-5 fill-red-200 hover:fill-red-400 hover:cursor-pointer"
													onClick={() => updateParts(parts.filter(p => p.File.name != part.File.name))}></RegularTrashCan>
											</td>
										</tr>
									})}
								</tbody>
							</table>

							<div className={`p-4 ${parts.length > 0 ? 'pt-2' : 'pt-4'}`}>
								<AddPartButton onChange={ev => {
									ev.preventDefault();

									if (ev.currentTarget.files == null) return;

									var newParts: PartData[] = (Array.from(Array(ev.currentTarget.files.length).keys())).map(i => {
										const f = ev.currentTarget.files![i];
										return {
											File: f,
											ModelName: f.name.substring(0, f.name.lastIndexOf('.')),
											FilamentId: 1,
											Quantity: 1
										}
									})

									updateParts([
										...parts,
										...newParts
									]);
								}}></AddPartButton>
							</div>
						</div>
					</div>
				</Dropdown>
								
				<br></br>

				<Dropdown className="mb-6" name="Notes">
					<InputBig id="notes" placeholder="Anything else we should know?" className="bg-white"/>
				</Dropdown>

				<p className="text-sm text-red-500">{error}</p>

				<div className="rounded-sm p-0 w-full">
					<input 
						className="font-semibold text-cool-black"
						style={{color: 'rgb(48 48 48)', backgroundColor: 'hsl(33, 100%, 52.9%)', background: 'linear-gradient(45deg, hsl(33, 100%, 52.9%) 0%, hsl(58.2, 100%, 68%) 100%)'}}
						disabled={pending || parts.length == 0} 
						type="submit" 
						value={pending ? "Contacting our Server..." : "Submit 3D Printing Request"}/>
				</div>
			</div>
		</form>
	)
}