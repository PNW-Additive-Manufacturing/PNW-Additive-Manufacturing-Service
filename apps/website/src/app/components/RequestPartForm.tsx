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
	RegularCrossCircle
} from "lineicons-react";
import QuantityInput from "./QuantityInput";
import Table from "./Table";
import { Dialog, Tab } from "@headlessui/react";
import Model from "../Types/Model/Model";
import Filament from "../Types/Filament/Filament";
import PopupFilamentSelector from "./PopupFilamentSelector";
import ModelViewer from "./ModelViewer";
import { modifyPart } from "../api/server-actions/maintainer";
import { NamedSwatch, SwatchConfiguration, templatePNW } from "./Swatch";

function AddPartButton({
	onChange
}: {
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	var inputRef = useRef<LegacyRef<HTMLInputElement>>();

	return (
		<>
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
			<button
				className="w-full px-4 py-2 mb-0 text-sm h-full"
				onClick={(ev) => {
					ev.preventDefault();
					(inputRef.current?.valueOf() as HTMLInputElement).click();
				}}>
				<RegularAddFiles className="inline mr-2 w-4 h-4 fill-white"></RegularAddFiles>
				Add More Files
			</button>
		</>
	);
}

interface PartData {
	File: File;
	ModelName: string;
	Quantity: number;
	Material: string;
	Color: SwatchConfiguration;
}

function RequestPartFormSubmit({ parts }: { parts: PartData[] }) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending || parts.length == 0}
			className="bg-gradient-linear-pnw-mystic w-full mb-0 text-cool-black hover:text-black h-full">
			{pending ? "Contacting our Server..." : "Submit Request"}
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

	return (
		<>
			<Dialog
				open={modifyingPart != null}
				onClose={() => setModifyingPart(undefined)}
				className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 flex w-screen items-center justify-center shadow-lg">
					<Dialog.Panel className="mx-auto rounded-md bg-white p-6 max-lg:w-2/3">
						<Dialog.Title className="mb-4 flex justify-between items-center">
							<div className="flex items-center gap-2">
								<RegularEmptyFile className="inline w-5 h-5 fill-gray-500"></RegularEmptyFile>
								{modifyingPart?.ModelName}
							</div>
							<div className="flex gap-4">
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
								<div
									className="flex items-center gap-2 fill-pnw-gold text-pnw-gold hover:cursor-pointer"
									onClick={() => setModifyingPart(undefined)}>
									Continue
									<RegularArrowRight></RegularArrowRight>
								</div>
							</div>
						</Dialog.Title>
						<div className="lg:flex gap-4">
							<div className="max-lg:hidden">
								<label>View Model</label>
								{modifyingPart?.File && (
									<div className="w-88 aspect-square outline-gray-300 bg-gray-50 outline-1 outline rounded-sm relative shadow-sm">
										<ModelViewer
											modelFile={
												modifyingPart.File
											}></ModelViewer>
									</div>
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
									<option value="fdm">3D Printing</option>
									<option disabled value="resin">
										Resin (Coming 2024)
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
				<div className="bg-white rounded-sm w-full grid auto-cols-auto auto-rows-auto p-6 gap-6">
					<div className="col-start-3 col-end-3 row-start-1 row-span-2 pt-2">
						<Input
							label="Request Name"
							type="text"
							id="name"
							name="requestname"
							placeholder={
								parts.length > 1
									? `${parts[0].ModelName} & ${
											parts.length - 1
									  } More`
									: parts.length > 0
									? parts[0].ModelName
									: "Enter the name of the request"
							}
						/>

						<div className="h-full">
							<label>Comments</label>
							<InputBig
								id="notes"
								name="notes"
								placeholder="Anything else we should know?"
								className="bg-white h-full"
								style={{ height: "calc(100% - 40px)" }}
							/>
						</div>
					</div>

					<div
						className="col-start-1 col-span-2 row-start-1 row-span-3"
						style={{ minWidth: "300px" }}>
						<div
							className="overflow-x-auto"
							style={{ minWidth: "25 rem" }}>
							{parts.length > 0 ? (
								<Table>
									<thead>
										<tr>
											<th>Model</th>
											<th>Filament</th>
											<th>Quantity</th>
										</tr>
									</thead>
									<tbody>
										{parts.map((part) => (
											<>
												<tr
													className="hover:cursor-pointer"
													onClick={() =>
														setModifyingPart(part)
													}>
													<td
														key={part.ModelName}
														className="bg-transparent w-fit outline-none border-0 block p-4 hover:cursor-pointer">
														<RegularEmptyFile className="inline w-5 h-5 fill-gray-500 mr-2"></RegularEmptyFile>
														{part.File.name}
													</td>
													<td>
														<NamedSwatch
															swatch={
																part.Color
															}></NamedSwatch>
													</td>
													<td>x{part.Quantity}</td>
												</tr>
											</>
										))}
									</tbody>
								</Table>
							) : (
								<p className="w-fit mt-4 text-sm">
									Upload a model to begin.
								</p>
							)}
						</div>
					</div>

					<div className="col-start-3 col-span-1 row-start-3 row-span-1">
						<div className="px-2 text-sm">
							<div className="font-semibold p-2 pt-0 pl-0">
								<RegularQuestionCircle className="inline w-4 h-4 fill-cool-black text-purple-200 mr-2"></RegularQuestionCircle>
								What is next?
							</div>
							<p
								className="text-sm"
								style={{ maxWidth: "600px" }}>
								You will receive a quote via email once your
								request has been reviewed and priced.
							</p>

							<div className="font-semibold p-2 pl-0">
								<RegularPackage className="inline w-4 h-4 fill-cool-black text-purple-200 mr-2" />
								Pick up
							</div>
							<p
								className="text-sm"
								style={{ maxWidth: "600px" }}>
								Pick up is available at the Design Studio on
								Campus with your ID.
							</p>
						</div>
					</div>

					<div className="rounded-sm p-0 w-full col-start-3 col-end-3 row-start-4 row-span-1 h-14">
						<RequestPartFormSubmit
							parts={parts}></RequestPartFormSubmit>
					</div>

					<div className="col-start-1 col-span-2 row-start-4 row-span-1 h-14">
						<AddPartButton
							onChange={(ev) => {
								ev.preventDefault();

								if (ev.currentTarget.files == null) return;

								console.log(ev.currentTarget.files);

								var newParts: PartData[] = Array.from(
									Array(ev.currentTarget.files.length).keys()
								)
									.filter((index) => {
										return (
											ev.currentTarget.files![index]
												.size < 20000000
										);
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
											Quantity: 1
										};
									});

								setParts([...parts, ...newParts]);
							}}></AddPartButton>
					</div>
				</div>
				{error && (
					<p className="px-2 text-sm text-red-500 col-start-3 col-span-1">
						{error}Hello
					</p>
				)}
			</form>
		</>
	);
}
