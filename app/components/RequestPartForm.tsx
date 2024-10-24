"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input, InputBig } from "@/app/components/Input";
import { requestPart } from "@/app/api/server-actions/request-part";
import DropdownSection from "./DropdownSection";
import { FilamentSelector } from "./FilamentSelector";
import { ChangeEventHandler, LegacyRef, Ref, useRef, useState } from "react";
import {
	RegularAddFiles,
	RegularEmptyFile,
	RegularQuestionCircle,
	RegularPencil,
	RegularTrashCan,
	RegularShip,
	RegularPackage,
	RegularArrowRight,
	RegularCrossCircle,
	RegularSpinnerSolid
} from "lineicons-react";
import QuantityInput from "./QuantityInput";
import Table from "./Table";
import { Dialog, Tab } from "@headlessui/react";
import Model from "../Types/Model/Model";
import Filament from "../Types/Filament/Filament";
import PopupFilamentSelector from "./PopupFilamentSelector";
import ModelViewer from "./ModelViewer";
import { modifyPart } from "../api/server-actions/maintainer";
import { NamedSwatch, Swatch, SwatchConfiguration, templatePNW } from "./Swatch";
import FormLoadingSpinner from "./FormLoadingSpinner";
import { Euler } from "three";
import { Label } from "./Inputs";

function AddPartButton({
	onChange
}: {
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	var inputRef = useRef<LegacyRef<HTMLInputElement>>();

	return (
		<div className="hover:cursor-pointer opacity-50 hover:opacity-100">
			<input
				className="hidden"
				ref={inputRef as any}
				hidden
				type="file"
				accept=".stl"
				multiple={true}
				onChange={(ev) => {
					ev.preventDefault();
					onChange(ev);
					ev.currentTarget.value = "";
				}}
			/>
			<div
				onClick={(ev) => {
					ev.preventDefault();
					(inputRef.current?.valueOf() as HTMLInputElement).click();
				}}
				className="rounded-md border-dashed border-2 px-2 border-pnw-gold w-full h-full bg-pnw-gold-light min-h-24 text-center flex gap-4 justify-center items-center">
				<div>
					<h2>Select to upload Models</h2>
					<p className="text-sm mt-2">Models must be in <span className="underline">Millimeters</span> and {"<"} 20 MB</p>
				</div>
			</div>
		</div>
	);
}

interface PartData {
	File: File;
	ModelName: string;
	Quantity: number;
	Material: string;
	Color: SwatchConfiguration;
	IsUserOriented: boolean;
}

function RequestPartFormSubmit({ parts }: { parts: PartData[] }) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending || parts.length == 0}
			className="bg-gradient-linear-pnw-mystic w-full h-fit mb-0 text-cool-black hover:text-black flex gap-2 items-center justify-center">
			{pending ? "Processing Request" : "Submit Request"}
			{pending && <RegularSpinnerSolid
				className={`inline-block h-auto w-auto animate-spin fill-cool-black`}
			/>}
		</button>
	);
}

//TODO: Make this work for more generic forms
export function RequestPartForm({
	filaments,
	children,
	previousUploadedModels
}: {
	filaments: Filament[];
	previousUploadedModels: Model[];
	children?: any;
}): JSX.Element {
	let [error, formAction] = useFormState<string, FormData>(requestPart, "");

	let [parts, setParts] = useState<PartData[]>([]);
	let [modifyingPart, setModifyingPart] = useState<PartData>();

	// Loop through each part and enable the modifyingPart popup if not given a print orientation by the user!
	if (modifyPart == null) {
		for (let part of parts) {
			if (!part.IsUserOriented) {
				setModifyingPart(part);
				break;
			}
		}
	}

	return (
		<>
			<Dialog
				open={modifyingPart != null}
				onClose={() => setModifyingPart(undefined)}
				className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 flex w-screen items-center justify-center shadow-lg">
					<Dialog.Panel className="rounded-md bg-white p-6 pb-10 max-lg:w-full max-lg:mx-4 out">
						<Dialog.Title className="mb-4 flex max-lg:flex-col lg:justify-between lg:items-center gap-4">
							<div className="flex items-center gap-2">
								<RegularEmptyFile className="inline w-5 h-5 fill-gray-500"></RegularEmptyFile>
								{modifyingPart?.ModelName}
							</div>
							<div className="flex max-lg:justify-between gap-4">
								<div
									className="flex items-center gap-2 text-gray-500 fill-gray-500 hover:cursor-pointer"
									onClick={() => {
										parts.splice(
											parts.indexOf(modifyingPart!),
											1
										);
										setParts(parts);
										setModifyingPart(undefined);
									}}>
									Remove
									<RegularCrossCircle></RegularCrossCircle>
								</div>
								<button
									className="flex m-0 bg-transparent items-center gap-2 fill-pnw-gold text-pnw-gold hover:cursor-pointer"
									onClick={() => setModifyingPart(undefined)}>
									Continue
									<RegularArrowRight></RegularArrowRight>
								</button>
							</div>
						</Dialog.Title>
						<div className="lg:flex gap-4">
							<div className="max-lg:hidden flex flex-col max-w-96">
								<label>View Model</label>
								{modifyingPart?.File && (
									<>
										<div className="w-full aspect-square outline-gray-300 bg-gray-50 outline-1 outline rounded-sm relative shadow-sm">
											<ModelViewer
												showOrientation={
													!modifyingPart!
														.IsUserOriented
												}
												onClickOrientation={(
													rotation
												) => {
													modifyingPart.IsUserOriented =
														true;
													// setModifyingPart(
													// 	modifyingPart
													// );
													setModifyingPart({
														...modifyingPart,
														IsUserOriented: true
													});
												}}
												modelFile={
													modifyingPart.File
												}></ModelViewer>
										</div>
										{/* <div className="grid grid-cols-3 p-2 gap-2">
											{[
												new Euler(Math.PI),
												new Euler(0, Math.PI),
												new Euler(0, 0, Math.PI),
												new Euler(Math.PI, Math.PI),
												new Euler(
													Math.PI,
													Math.PI,
													Math.PI
												)
											].map((rot) => (
												<div className=" bg-gray-300">
													<ModelViewer
														modelFile={
															modifyingPart.File
														}
														modelRotation={rot}
													/>
												</div>
											))}
										</div> */}
									</>
								)}
							</div>

							<div>
								<label>Quantity</label>
								<input
									type="number"
									min={1}
									max={80}
									required
									defaultValue={modifyingPart?.Quantity ?? 1}
									onChange={(v) => {
										modifyingPart!.Quantity =
											v.currentTarget.valueAsNumber;
										setModifyingPart(modifyingPart);
									}}></input>

								<label>Process</label>
								<select defaultValue="fdm">
									<option value="fdm">
										3D Printing (FDM)
									</option>
									<option disabled value="resin">
										Resin Printing (SLA)
									</option>
								</select>

								<label>Filament Preference</label>
								<PopupFilamentSelector
									filaments={filaments}
									defaultFilament={{
										colorName: modifyingPart?.Color.name,
										material: modifyingPart?.Material
									}}
									onChange={(filament) => {
										modifyingPart!.Material =
											filament.material;
										modifyingPart!.Color = filament.color;
										setModifyingPart(modifyingPart);
									}}></PopupFilamentSelector>
							</div>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			<form
				action={(formData) => {
					for (var part of parts) {
						formData.append("file", part.File);
						formData.append("quantity", part.Quantity.toString());
						formData.append("material", part.Material);
						formData.append("color", part.Color.name);
					}
					formAction(formData);
				}}>
				{/* <div className="grid grid-cols-3 gap-6 mb-6">
					<div className="out bg-white outline-pnw-gold p-6">
						<h2>FDM / Plastic Printing</h2>
						<p className="text-sm mt-2">PLA, PETG, ABS, CP</p>
					</div>
					<div className="out bg-white outline-pnw-gold p-6">
						<h2>Resin Printing</h2>
					</div>
					<div className="out bg-white outline-pnw-gold p-6">
						<h2>Metal X</h2>
					</div>
				</div> */}
				<div className="bg-white rounded-sm w-full lg:flex p-6 gap-6 out">
					<div
						className="w-full max-lg:mb-4"
						style={{ minWidth: "300px" }}>
						<Label content={"3D Models (.STL) Click to Modify"} />
						<div
							className="w-full lg:min-w-96">
							{parts.length > 0 && (
								<>
									<Table className="mb-2 overflow-hidden">
										{/* <thead>
											<tr>
												<th>
													<RegularEmptyFile className="inline fill-gray-500 mr-1 mb-1"></RegularEmptyFile>
													Model
												</th>
												<th className="max-lg:hidden">
													Filament
												</th>
												<th className="max-lg:hidden">
													Quantity
												</th>
											</tr>
										</thead> */}
										<tbody>
											{parts.map((part) => (
												<>
													<tr
														className="hover:cursor-pointer"
														onClick={() =>
															setModifyingPart(
																part
															)
														}>
														<td
															key={part.ModelName}
															className="bg-transparent w-fit outline-none border-0 block hover:cursor-pointer">
															{/* <RegularEmptyFile className="inline w-5 h-5 fill-gray-500 mr-2"></RegularEmptyFile> */}
															{part.File.name}
														</td>
														<td className="max-lg:hidden">3D Printing (FDM)</td>
														<td>
															<span className="mr-2">{part.Material}</span>
															<Swatch swatch={part.Color}></Swatch>
														</td>
														<td className="max-lg:hidden ">
															x{part.Quantity}
														</td>
													</tr>
												</>
											))}
										</tbody>
									</Table>
								</>)}
							<div>
								<AddPartButton
									onChange={(ev) => {
										ev.preventDefault();

										if (ev.currentTarget.files == null) return;

										var newParts: PartData[] = Array.from(
											Array(ev.currentTarget.files.length).keys()
										)
											.filter((index) => {

												// Boolean if a file with the same path has been added,
												const isAlreadyAdded = parts.some(p => p.File.name == ev.currentTarget.files![index]?.name);

												return !isAlreadyAdded && ev.currentTarget.files![index].name.endsWith(".stl") && ev.currentTarget.files![index].size < 20000000;
											})
											.map((i) => {
												const f = ev.currentTarget.files![i];
												return {
													File: f,
													ModelName: f.name.substring(
														0,
														f.name.lastIndexOf(".")
													),
													Material: "PLA",
													Color: filaments.at(0)!.color,
													Quantity: 1,
													IsUserOriented: false
												};
											});

										setParts([...parts, ...newParts]);
									}} />
							</div>
						</div>
					</div>

					<div className="lg:w-188">
						<Input
							label="Request Name"
							type="text"
							id="name"
							name="requestname"
							placeholder={
								parts.length > 1
									? `${parts[0].ModelName} & ${parts.length - 1
									} More`
									: parts.length > 0
										? parts[0].ModelName
										: "Enter the name of the request"
							}
						/>

						<label>Comments</label>
						<InputBig
							id="notes"
							name="notes"
							max={1000}
							placeholder="Anything else we should know? Just prototyping, need high-quality?"
						/>

						<div className="lg:px-4 text-sm my-4">
							<div className="font-semibold py-2">
								What is next?
							</div>
							<p
								className="text-sm"
								style={{ maxWidth: "600px" }}>
								Once you submit this request, it will be added to your account, and you'll receive email updates regarding the status of your parts.
								If you're looking for a more detailed view of your requests and orders, please head over to your orders page once submitted.
							</p>
						</div>

						<RequestPartFormSubmit parts={parts} />
					</div>


					{/* <div className="max-lg:hidden col-start-1 col-span-2 row-start-4 row-span-1 h-14">
					</div> */}
				</div>
				{error && (
					<p className="px-2 text-sm text-red-500 col-start-3 col-span-1">
						{error}
					</p>
				)}
			</form>
		</>
	);
}
