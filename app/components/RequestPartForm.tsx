"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input, InputBig } from "@/app/components/Input";
import { requestPart } from "@/app/api/server-actions/request-part";
import { ChangeEventHandler, LegacyRef, useRef, useState } from "react";
import { RegularEmptyFile, RegularArrowRight, RegularCrossCircle, RegularSpinnerSolid, RegularWarning, RegularMoneyLocation, RegularMoneyProtection } from "lineicons-react";
import Table from "./Table";
import { Dialog } from "@headlessui/react";
import Model from "../Types/Model/Model";
import Filament from "../Types/Filament/Filament";
import PopupFilamentSelector from "./PopupFilamentSelector";
import ThreeModelViewer from "./ThreeModelViewer";
import { Swatch, SwatchConfiguration } from "./Swatch";
import { BufferGeometry } from "three";
import { Label } from "./Inputs";
import { toast } from 'react-toastify';
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import Link from "next/link";
import { addDays, addMinutes, fixInputDate, formatDateForHTMLInput, formatTimeForHTMLInput, withDate, withTime } from "../utils/TimeUtils";
import { formateDateWithTime } from "../api/util/Constants";
import { getLeadTimeDate, getLeadTimeInDays } from "../Types/Request/Request";
import FilamentSelector, { FilamentInsight } from "./FilamentSelector";

function AddPartButton({
	onChange
}: {
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	var inputRef = useRef<HTMLInputElement>();

	return (
		<div className="hover:cursor-pointer opacity-70 hover:opacity-100">
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
					inputRef.current!.click();
				}}
				className="rounded-md border-dashed border-2 px-4 border-pnw-gold w-full h-full bg-pnw-gold-light flex gap-4 max-lg:justify-center max-lg:text-center items-center" style={{ minHeight: "5.5rem" }}>
				<div>
					<h2>Select to upload Models</h2>
					<p className="text-xs mt-2">Models must be in <span className="font-bold">Millimeters</span> and <span className="font-bold text-nowrap">{"<"} 20 MB</span></p>
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
	LeadTimeInDays: number;
	Filament: Filament;
	Color: SwatchConfiguration;
	Geometry: BufferGeometry;
	IsUserOriented: boolean;
}

function RequestPartFormSubmit({ parts }: { parts: PartData[] }) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending || parts.length == 0}
			className="w-full h-fit mb-0 text-white text-left text-sm">
			{pending ? "Processing Request" : "Submit Request"}
			{pending && <RegularSpinnerSolid
				className={`inline-block ml-2 fill-white h-auto w-auto animate-spin`}
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
	let [tooSmallPromptCount, setTooSmallPromptCount] = useState(0);

	const checkboxElem = useRef<HTMLInputElement>();

	const [needBy, setNeedBy] = useState<Date | undefined>(undefined);

	const requestNamePlaceholder = parts.length > 1 ? `${parts[0].ModelName} & ${parts.length - 1} More` : parts.length > 0 ? parts[0].ModelName : "Enter the name of the request";

	const leadTimeInDays = parts.length > 0 ? getLeadTimeInDays(parts.map(p => p.LeadTimeInDays)) : null;

	// The minimum date which the order should be needed resting our lead-times.
	const leadTimeDate = parts.length > 0 ? addDays(new Date(), getLeadTimeInDays(parts.map(p => p.LeadTimeInDays))!) : null;

	if (needBy == null && leadTimeDate) {
		setNeedBy(addMinutes(leadTimeDate, 30));
	}

	return (
		<>


			{modifyingPart != undefined && <Dialog
				open={modifyingPart != null}
				onClose={() => setModifyingPart(undefined)}
				className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 flex w-screen items-center justify-center shadow-lg">
					<Dialog.Panel className="rounded-md bg-white p-8 max-lg:w-full max-lg:mx-4">
						<Dialog.Title className="mb-4 flex max-lg:flex-col lg:justify-between lg:items-center gap-4">
							<div className="flex font-light text-xl items-center gap-2">
								<RegularEmptyFile className="inline fill-pnw-gold"></RegularEmptyFile>
								{modifyingPart?.ModelName}
							</div>
							<div className="flex max-lg:justify-between gap-2">
								<div
									className="flex items-center gap-2 py-2 opacity-75 font-light hover:cursor-pointer"
									onClick={() => {
										parts.splice(
											parts.indexOf(modifyingPart!),
											1
										);
										setParts(parts);
										setModifyingPart(undefined);
										toast.success(`Removed ${modifyingPart!.ModelName} from your request.`);
									}}>
									Remove
									<RegularCrossCircle></RegularCrossCircle>
								</div>
								<button
									className="flex m-0 bg-transparent items-center gap-2 py-2 fill-pnw-gold text-pnw-gold font-light hover:cursor-pointer"
									onClick={() => setModifyingPart(undefined)}>
									Continue
									<RegularArrowRight></RegularArrowRight>
								</button>
							</div>
						</Dialog.Title>
						<div className="lg:flex gap-4">
							<div className="max-lg:hidden flex flex-col max-w-96 h-auto">
								<label>View Model</label>
								{modifyingPart?.File && (
									<div className="w-full h-full shadow-sm out">
										<ThreeModelViewer
											showOrientation={
												!modifyingPart!
													.IsUserOriented
											}
											onClickOrientation={(
												rotation
											) => {
												modifyingPart.IsUserOriented =
													true;
												setModifyingPart({
													...modifyingPart,
													IsUserOriented: true
												});
											}}
											modelFile={
												modifyingPart.File
											}></ThreeModelViewer>
									</div>
								)}
							</div>

							<div>
								<label>Quantity</label>
								<input
									className="w-full"
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

								<label>Process / Material</label>
								<p className="mb-4 text-sm">Review each <Link className="underline" target="_blank" href={"/materials"}>process and material</Link> before submission.</p>
								{/* <select defaultValue="FDM">
									<option value="FDM`">
										FDM
									</option>
									<option disabled value="LCD`">
										Resin Printing
									</option>
									<option disabled value="Metal FFF">
										Metal Printing
									</option>
								</select> */}

								{/* <label>Filament Preference</label> */}
								{/* <PopupFilamentSelector
									filaments={filaments}
									defaultFilament={{
										colorName: modifyingPart?.Color.name,
										material: modifyingPart?.Material
									}}
									onChange={(filament) => {
										if (modifyingPart) {
											// Update the modifyingPart properties
											modifyingPart.Material = filament.material;
											modifyingPart.Color = filament.color;
											modifyingPart.LeadTimeInDays = filament.leadTimeInDays;

											// Replace the modified part in the parts array
											const updatedParts = parts.map((part) =>
												part === modifyingPart ? { ...modifyingPart } : part
											);

											// Trigger state update to refresh the component
											setParts(updatedParts);

											// Optionally log or notify the user
											toast.info(`Filament updated for ${modifyingPart.ModelName}. Lead time: ${filament.leadTimeInDays} days.`);
										}
									}}>

								</PopupFilamentSelector> */}

								<div className="flex gap-4">
									<FilamentSelector filaments={filaments} defaultFilament={modifyingPart.Filament} canSelectOutOfStock={false} displayFilamentInsight={false} onChange={(filament) => {
										if (modifyingPart) {
											// Update the modifyingPart properties
											modifyingPart.Material = filament.material;
											modifyingPart.Color = filament.color;
											modifyingPart.LeadTimeInDays = filament.leadTimeInDays;
											modifyingPart.Filament = filament;

											// Replace the modified part in the parts array
											const updatedParts = parts.map((part) =>
												part === modifyingPart ? { ...modifyingPart } : part
											);

											// Trigger state update to refresh the component
											setParts(updatedParts);

											// Optionally log or notify the user
											// toast.info(`Filament updated for ${modifyingPart.ModelName}. Lead time: ${filament.leadTimeInDays} days.`);
										}
									}}></FilamentSelector>
								</div>
								<div className="mt-2">
									<FilamentInsight selectedFilament={modifyingPart.Filament}></FilamentInsight>
								</div>
							</div>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>}

			<form
				action={(formData) => {
					// This isn't exactly necessary to all browsers, some will require the user to check the box and some will not. 
					// We could also just disable the submit button in the future.
					if (!checkboxElem.current!.checked) {
						toast.error("You must accept accept all terms and conditions before submission.");
						return;
					}

					for (var part of parts) {
						formData.append("file", part.File);
						formData.append("quantity", part.Quantity.toString());
						formData.append("material", part.Material);
						formData.append("color", part.Color.name);
					}
					formData.set("need-by", needBy as any);
					formAction(formData);
				}}>

				<div className="bg-white rounded-sm w-full p-6 out">
					<div className={"gap-6 lg:flex"}>
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
															key={part.ModelName}
															onClick={() =>
																setModifyingPart(
																	part
																)
															}>
															<td
																className="text-sm bg-transparent w-fit outline-none border-0 block hover:cursor-pointer">
																{part.File.name}
															</td>
															<td className="max-lg:hidden text-sm">3D Printing (FDM)</td>
															<td className="text-sm">
																<span className="mr-2">{part.Material}</span>
																<Swatch swatch={part.Color} style="long"></Swatch>
															</td>
															<td className="max-lg:hidden text-sm">
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
										onChange={async (ev) => {
											ev.preventDefault();

											if (ev.currentTarget.files == null) return;

											const partsToBeAdded: PartData[] = (await Promise.all(Array.from(ev.currentTarget.files).map(async file => {
												let parsedSTLGeometry: BufferGeometry | null = null;
												try {
													parsedSTLGeometry = new STLLoader().parse(await file.arrayBuffer());
													parsedSTLGeometry.computeBoundingBox();
												}
												catch (err) {
													console.log(`Failed to parse geometry ${file.name} while validating constraints`, err);
												}

												return {
													File: file,
													Quantity: 1,
													Geometry: parsedSTLGeometry,
													ModelName: file.name.substring(0, file.name.lastIndexOf(".")),
													Material: "PLA",
													Filament: filaments.at(0),
													LeadTimeInDays: 1,
													Color: filaments.at(0)!.color,
													IsUserOriented: false
												} as PartData;
											})))
												.filter(p => {
													console.log(p.File.name);

													// Boolean if a file with the same path has been added,
													const isAlreadyAdded = parts.some(refP => refP.File.name == p.File.name);
													const isSTL = p.File.name.toLowerCase().endsWith(".stl");
													const isWithinSize = p.File.size < 20000000;

													if (isAlreadyAdded) {
														toast.warning(`The model ${p.ModelName} has already been added to this request!`);
														return false;
													}

													if (!isSTL) {
														toast.error(`The model ${p.ModelName} is not in STL Format!`);
														return false;
													}

													if (!isWithinSize) {
														toast.error(`The model ${p.ModelName} file size is too large!`);
														return false;
													}

													if (p.Geometry == null) {
														toast.error(`The model ${p.ModelName} was unable to be parsed. Ensure it is a valid STL!`);
														return false;
													}
													else {
														const maxValue = Math.max(
															p.Geometry.boundingBox!.max.x - p.Geometry.boundingBox!.min.x,
															p.Geometry.boundingBox!.max.y - p.Geometry.boundingBox!.min.y,
															p.Geometry.boundingBox!.max.z - p.Geometry.boundingBox!.min.z,
														);

														console.log(maxValue);

														if (maxValue < 10 || (p.Geometry.boundingBox!.max.z - p.Geometry.boundingBox!.min.z <= 0.8)) {
															setTooSmallPromptCount(tooSmallPromptCount + 1);
															toast.error(<span>The model {p.ModelName} is too small. Ensure you have exported the model using Millimeters!<br />Refer to <Link target="_blank" href={"https://youtu.be/dYo6kzmtLw0?si=kGcNq7dc2Hynqad_&t=375"} className="underline">Export STL in Millimeters using Onshape</Link></span>);
															return false;
														}

														// An axis of the model is greater than 256!
														if (maxValue > 256) {
															toast.error(`The model ${p.ModelName} is too large (Must be 256 x 256 x 256). Ensure you have exported the model using Millimeters or split your model up into multiple parts!`);
															return false;
														}
													}
													return true;
												});

											setParts([...parts, ...partsToBeAdded]);
										}} />
								</div>
							</div>
						</div>

						<div className="lg:w-188">
							<Input
								label="Request Name"
								type="text"
								id="requestname"
								placeholder={requestNamePlaceholder}
							/>

							<label>Comments</label>
							<InputBig
								id="notes"
								name="notes"
								max={1000}
								placeholder="Anything else we should know? Just prototyping, need high-quality?"
							/>

							{leadTimeInDays && leadTimeDate && needBy && <>

								<label className="mt-4">When do you need these parts?</label>
								<p className="text-sm font-light mb-4">
									Allow at least {leadTimeInDays} Day(s) from {formateDateWithTime(leadTimeDate)} to print. Check our <Link target="_blank" className="underline" href="/schedule">pickup schedule</Link> for further details.
								</p>


								<div className="flex max-lg:flex-col gap-4">
									<input className="w-full p-3 lg:text-sm mb-0" type="date" required defaultValue={formatDateForHTMLInput(needBy)} onChange={(ev) => {
										setNeedBy(withDate(needBy, fixInputDate(ev.currentTarget.valueAsNumber)));
									}} />
									<input className="w-full p-3 lg:text-sm mb-0" type="time" required defaultValue={formatTimeForHTMLInput(needBy)} onChange={(ev) => {
										setNeedBy(withTime(needBy, fixInputDate(ev.currentTarget.valueAsNumber)));
									}} />
								</div>

								{/* {needBy && <p>{formateDateWithTime(needBy)}</p>} */}

								{needBy && leadTimeDate.getTime() > needBy.getTime() && <p className="text-pnw-gold text-sm mt-4">
									Please note: Requests made within the minimum lead time will incur a 20% fee and may not meet the desired completion date.
								</p>}
							</>}

							<div className="text-xs flex gap-4 mt-4 mb-4">
								<div>
									<input className="w-fit inline mb-0 mr-2" type="checkbox" defaultChecked={false} required={true} ref={checkboxElem as any} />
									You acknowledge and accept all uploading <Link className="underline" target="_blank" href="/terms-and-conditions">Terms and Conditions</Link>.
								</div>
							</div>


							{/* <div className="text-sm lg:px-2 my-4">
								<label>What is next?</label>
								<p
									className="text-sm"
									style={{ maxWidth: "600px" }}>
									Upon submission, this request will be added to your account, and you'll receive email updates on its status. For more details, visit your orders page.
								</p>
							</div> */}

							<RequestPartFormSubmit parts={parts} />
						</div>
					</div>
				</div>

				{error && (
					<p className="px-2 my-2 text-right text-sm text-red-500 col-start-3 col-span-1">
						{error}
					</p>
				)}
			</form>
		</>
	);
}
