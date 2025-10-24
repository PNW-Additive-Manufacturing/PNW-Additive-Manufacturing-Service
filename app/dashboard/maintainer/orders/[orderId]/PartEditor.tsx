import { revokePart } from "@/app/api/server-actions/maintainer";
import FilamentSelector from "@/app/components/FilamentSelector";

import { MachineData } from "@/app/components/Machine";
import ThreeModelViewer from "@/app/components/ThreeModelViewer";

import { SelectorStatusPill } from "@/app/components/StatusPill";
import { NamedSwatch } from "@/app/components/Swatch";
import Filament from "@/app/Types/Filament/Filament";
import {
	isPriced,
	PartStatus,
	PartWithModel,
	isRevoked,
	getStatusColor,
	
} from "@/app/Types/Part/Part";
import {
	hasQuote,
	isPaid,
	RequestWithParts
} from "@/app/Types/Request/Request";
import { Dialog } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowRight,
  faCircleXmark,
  faDownload,
  faFlag,
  faUpload,
  faWeightHanging
} from "@fortawesome/free-solid-svg-icons";

import React, { ChangeEvent, ChangeEventHandler, Suspense, useContext, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { Color } from "three";
import { string } from "zod";
import { toast } from "react-toastify";
import RevokeInput from "@/app/components/RevokeInput";
import { confirmationForm, FloatingFormContainer, FloatingFormContext, FloatingFormQuestion } from "@/app/components/FloatingForm";
import { LabelWithIcon } from "@/app/components/LabelWithIcon";
import { APIData } from "@/app/api/APIResponse";
import { makeStringNotEmpty } from "@/app/utils/StringUtils";
import usePartModifier from "@/app/hooks/usePartState";
import useClipboard from "@/app/hooks/useClipboard";
import { Figure } from "@/app/components/Figures";

function PartRevokeForm({
	part,
	showRevoke,
	setShowRevoke
}: {
	part: PartWithModel;
	showRevoke: boolean;
	setShowRevoke: (value: boolean) => void;
}) {
	const [revokeError, revokeFormAction] = useFormState<any, FormData>(
		revokePart,
		""
	);

	return (
		<>
			<Dialog
				open={showRevoke}
				// keepMounted
				onClose={() => setShowRevoke(false)}
				aria-describedby="alert-dialog-slide-description">
				<form
					action={async (payload) => {
						revokeFormAction(payload);
						setShowRevoke(false);
					}}>
					<div className="py-6 px-9">
						<h2 className="text-2xl font-light mb-2">
							Decline {part.model.name} with Issues
						</h2>
						<br />
						<input
							type="number"
							name="partId"
							id="partId"
							readOnly
							value={part.id}
							hidden
						/>

						<label>DFM Violations / Comments</label>
						<textarea
							className="mt-2 w-92"
							name="reasonForRevoke"
							placeholder="Too much support, thin edges, and etc."
							required
						/>
						<button className="mb-0">Deny Model</button>
						<span className="text-red-600">{revokeError}</span>
					</div>
				</form>
			</Dialog>
		</>
	);
}

type PartEditorProps = {
	request: RequestWithParts;
	part: PartWithModel;
	index: number;
	isQuoted: boolean;
	filaments: Filament[];
	count: number;
	processingMachine?: MachineData | null;
};

export default function PartEditor({
	request,
	part,
	index,
	isQuoted,
	filaments,
	count,
	processingMachine
}: PartEditorProps) {
	const { register, watch, setValue, getValues } = useForm<{
		costInDollars: number;
		status: string;
		weightOfModel: number;
		reasonForRefund: string;
		refundQuantity: number;
		supplementedFilamentMaterial: string;
		supplementedFilamentColorName: string;
		supplementReason: string;
	}>();

	const isEditingFilament =
		watch(
			"supplementedFilamentColorName",
			part.supplementedFilament?.color?.name
		) != part.supplementedFilament?.color?.name &&
		watch(
			"supplementedFilamentMaterial",
			part.supplementedFilament?.material
		) != part.supplementedFilament?.material;
	const isStatusChanged = watch("status", part.status) != part.status;
	const isCostChanged = makeStringNotEmpty(watch("costInDollars") as any) != undefined &&
		(watch("costInDollars") ?? part.priceInDollars) != part.priceInDollars;
	const isChanged = isEditingFilament || isStatusChanged || isCostChanged;
	const selectedStatusColor = getStatusColor(
		watch("status", part.status) as PartStatus
	);

	const { copyToClipboard } = useClipboard();
	const { result, updatePart } = usePartModifier();
	const { addForm } = useContext(FloatingFormContext);

	return (
		<div key={part.id} className="h-full">
			<form action={(data) => {

				let modifiedData: NonNullable<Parameters<typeof updatePart>[1]> = {};

				if (isStatusChanged) modifiedData.status = data.get("status") as PartStatus;
				if (isEditingFilament) {
					// TODO: Make action take in data from react-form lib.
					modifiedData.supplementedFilamentName = watch("supplementedFilamentColorName") as string;
					modifiedData.supplementedFilamentMaterial = watch("supplementedFilamentMaterial") as string;
					modifiedData.supplementReason = watch("supplementReason") as string;
				}
				if (isCostChanged) modifiedData.priceInDollars = data.get("costInDollars") as any;

				console.log(modifiedData);

				updatePart(part, modifiedData);

			}} className="h-full">
				<input
					readOnly={true}
					hidden
					value={part.id}
					name="partId"
					id="partId"></input>

				<div className="flex gap-4 h-full">
					<div className={`shadow-sm out w-full bg-white p-4 lg:p-6`}>
						<div className="flex items-center gap-4 mb-2">
							<p className="w-full truncate hover:fill-pnw-gold hover:text-pnw-gold hover:cursor-pointer font-medium" onClick={() => {
								copyToClipboard(part.model.name).then(() => toast.success(`Part name copied to clipboard!`, { autoClose: 1000 }));
							}}>
								{part.model.name}
							</p>

							<div className="flex text-sm bg-white gap-x-4 gap-y-2 items-center">
								{isChanged && <button
									className={`w-fit text-[length:inherit] px-0 py-0 text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold`}
									disabled={!isChanged || request.isFulfilled}>
									<FontAwesomeIcon icon={faUpload} className="w-4 h-4 mb-0.5 inline mr-2"/>
									Save
								</button>}

								<SelectorStatusPill
									register={register("status")}
									statusColor={selectedStatusColor}
									defaultValue={part.status}>
									{part.status !=
										PartStatus.Denied && !request.isFulfilled && (
											<option
												value={PartStatus.Pending}
												key={PartStatus.Pending}>
												Pending
											</option>
										)}
									{!request.isFulfilled && !isPriced(part) && (
										<option
											value={PartStatus.Denied}
											key={PartStatus.Denied}>
											Denied
										</option>
									)}
									{request.isFulfilled && <option
										value={
											PartStatus.Printed
										}
										key={
											PartStatus.Printed
										}>
										Printed
									</option>}
									{!request.isFulfilled && isPaid(request) && (
										<>
											<option
												value={
													PartStatus.Printing
												}
												key={
													PartStatus.Printing
												}>
												Printing
											</option>
											<option
												value={
													PartStatus.Printed
												}
												key={
													PartStatus.Printed
												}>
												Printed
											</option>
											<option
												value={
													PartStatus.Failed
												}
												key={PartStatus.Failed}>
												Failed
											</option>
										</>
									)}
								</SelectorStatusPill>
							</div>
						</div>

						<div className={`lg:flex gap-4`}>
							<div className="w-full">
								{/* {isRefunded(part) ? (
									<></>
								) : (
									isPaid(request) &&
									part.status != PartStatus.Failed &&
									watch("status") == PartStatus.Failed && (
										<div className="mt-4 px-0">
											<textarea
												{...register("reasonForRefund")}
												className="outline outline-1 outline-gray-300 mb-0 w-full"
												required
												placeholder="Reason for failure"></textarea>

											<div className="w-full">
												<div className="flex items-center gap-2 w-full">
													<input
														{...register(
															"refundQuantity",
															{
																value: part.quantity,
																min: 1,
																max: part.quantity,
																required: true
															}
														)}
														className="mb-0 w-full"
														type="range"
														required
														min={1}
														max={part.quantity}></input>

													<input
														title="Refund Quantity"
														className="min-w-12 p-0 min w-fit text-center mb-0 bg-transparent"
														type="number"
														required={false}
														value={watch(
															"refundQuantity"
														)}
														min={1}
														max={part.quantity}
														onChange={(ev) =>
															setValue(
																"refundQuantity",
																ev.currentTarget
																	.valueAsNumber
															)
														}></input>
												</div>

												{isPriced(part) && (
													<p>
														Account will be refunded $
														{(
															part.priceInDollars! *
															watch("refundQuantity")
														).toFixed(2)}
													</p>
												)}
											</div>
										</div>
									)
								)} */}

								<div className={"w-full flex gap-4 flex-col-reverse"}>
									<div className="w-full h-full out relative ">
										{/* Display if multiple revisions */}
										{/* <div className="absolute top-0 right-0 text-xs bg-white out rounded-none rounded-bl-md text-subtle px-2 py-1.5 z-10 pl-3" style={{ borderRadius: "0px 3px 0px 12px" }}>
											Revision #2
										</div> */}
										<div className="w-full h-36 bg-gray-50 rounded-sm">
											<ThreeModelViewer
												isAvailable={!part.model.isPurged}
												modelSize={part.model?.fileSizeInBytes}
												modelURL={`/api/download/model?modelId=${part.modelId}`} />
										</div>
										<div>
											<div className="bg-background text-subtle w-full p-3 text-xs rounded-b-sm">
												<div className="flex gap-2 flex-wrap justify-between items-start">
													<div>

														{part.model.analysisResults
															? <>
																<div className="w-fit gap-2 fill-subtle">
																	<span className="mr-2">Model Analysis</span><FontAwesomeIcon icon={faClock} className="inline mb-0.5" /> {part.model.analysisResults.estimatedDuration} min<FontAwesomeIcon icon={faWeightHanging} className="ml-2 inline mb-0.5" /> {part.model.analysisResults.estimatedFilamentUsedInGrams} g
																</div>
															</>
															: part.model.analysisFailedReason
																? <>
																	<p className="text-warning fill-warning">{part.model.analysisFailedReason}</p>
																</>
																: <p className="text-subtle">Queued for Analysis</p>}
													</div>

													<div className="shrink">
														{/* This needs to go to user-facing dashboard */}
														{/* {isRevoked(part) && <a className={`text-warning fill-warning mb-0.5 text-right block`}
															href={part.model.isPurged ? undefined : `/api/download/model?modelId=${part.modelId}`}
															download={`${part.model.name}.stl`}
															target="_blank">
															Upload Revision
															<RegularUpload className="ml-2 inline mb-0.5 fill-inherit" />
														</a>} */}
														{!part.model.isPurged && <a className={`text-gray-500 fill-gray-500 hover:text-black text-right hover:fill-black text-nowrap block`}
															href={part.model.isPurged ? undefined : `/api/download/model?modelId=${part.modelId}`}
															download={`${part.model.name}.stl`}
															target="_blank">
															Download
															<FontAwesomeIcon icon={faDownload} className="ml-2 inline mb-0.5 fill-inherit" />
														</a>}
													</div>

												</div>

												{isRevoked(part) &&
													<div className="mt-2">
														<div className="text-warning">
															{part.deniedReason}
															{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
															<span className={"fill-warning ml-2"}
																onClick={() => {
																	addForm(confirmationForm({
																		description: `Are you sure you would like to remove the issue from ${part.model.name}?`,
																		onSubmit: async (data) => {
																			data.set("partId", part.id as any);
																			data.set("revokePartReason", null as any);
																			try {
																				const res = await revokePart(data);
																				if (res.success) {
																					part.status = PartStatus.Pending;
																					if (res.emailSent) {
																						toast.success("Successfully sent Email");
																					}
																					else toast.error(`Could not send email to ${request.firstName}`);
																				}
																				return res.success ? null : res.errorMessage ?? "Unknown exception";
																			}
																			catch (ex) {
																				console.error(ex);
																				toast.error(`Could not send email to ${request.firstName}`);
																				return "Could not send request to AMS!";
																			}
																		},
																		submitName: "Remove Flag"
																	}));
																}} >
																<FontAwesomeIcon icon={faCircleXmark} className="inline hover:cursor-pointer mb-0.5" />
															</span>
														</div>
													</div>}


												{part.status == PartStatus.Printing && processingMachine && <div className="flex items-end gap-2 w-full mt-2 text-xs text-gray-500">
													<div className="flex gap-2 items-center w-full" style={{ borderBottomRightRadius: "0px", borderBottomLeftRadius: "0px" }}>
														<span className="xl:text-nowrap">Printing on {processingMachine.identifier} ({processingMachine.model})</span>
														<span className="max-xl:hidden">{processingMachine.progress}%</span>
														<progress className="colored max-xl:hidden h-2 opacity-75" value={processingMachine.progress} max={100}></progress>
													</div>
												</div>}
											</div>
										</div>
									</div>
									<div>
										<div className="text-sm flex flex-col gap-0.5">

											<Figure name={"Manufacturing Process:"} amount={part.supplementedFilament?.technology ?? part.filament?.technology} style={"inline"} />

											<Figure name="Filament:" style="inline" amount={<>

												{part.supplementedFilament != undefined && (
													<>
														{`${part.filament!.material.toUpperCase()} `}
														<NamedSwatch swatch={part.filament!.color} style="compact" />
														<FontAwesomeIcon icon={faArrowRight} className="inline mx-2 fill-gray-500" style={{ marginBottom: "3px" }}/>
														{`${part.supplementedFilament.material.toUpperCase()} `}
														<NamedSwatch swatch={part.supplementedFilament.color} style="compact" />
													</>
												)}

												{part.supplementedFilament == null && (
													<>
														{`${part.filament!.material.toUpperCase()} `}
														<NamedSwatch swatch={part.filament!.color} style="compact" />

														{/* Display the supplement filament button */}
														{!hasQuote(request) && <span className="ml-2 button" onClick={() => addForm({

															title: `Supplement ${part.filament?.material?.toUpperCase()} ${part.filament?.color.name}`,
															description: `${request.firstName} will receive a notification that their intended filament has been changed.`,
															submitName: `Confirm Supplementation`,
															onSubmit: async (data) => {
																const colorName = data.get("supplementedFilamentColorName") as string;
																const material = data.get("supplementedFilamentMaterial") as string;
																console.log(part.filament?.color.name, colorName, part.filament?.material, material);
																if (part.filament?.color.name == colorName && part.filament.material == material) {
																	return "You must selected a different filament than the one already selected!";
																}

																setValue("supplementReason", data.get("supplement-reason") as any);
																setValue("supplementedFilamentColorName", colorName);
																setValue("supplementedFilamentMaterial", material)
																return null;
															},
															questions: [
																{
																	name: "Supplemented Material",
																	required: true,
																	element: <div className="flex flex-col gap-4">
																		<FilamentSelector
																			canSelectOutOfStock={true}
																			displayFilamentInsight={true}
																			colorNameInputID="supplementedFilamentColorName"
																			materialInputID="supplementedFilamentMaterial"
																			filaments={filaments} />
																	</div>
																},
																{
																	type: "textarea",
																	name: "Reason for Supplementing",
																	id: "supplement-reason",
																	required: true,
																	placeholder: "Please specify the reason for changing the filament. For example: \"Insufficient material for the project\" or \"Customer approved the change.\""
																}
															]

														})}>Supplement</span>}
													</>
												)}
											</>} />

											{(part.supplementedFilament != null || watch("supplementReason") != null) && <Figure name={"Supplemented Reason:"} amount={watch("supplementReason") || part.reasonForSupplementedFilament || "None was provided!"} style={"inline"} />}

											<Figure name={"Quantity:"} amount={`x${part.quantity}`} style={"inline"} />

											<Figure name={"Cost per-unit:"} style={"inline"} amount={<>

												<span className={!isQuoted && (getValues("costInDollars") == undefined || getValues("costInDollars").toString() == "") ? "opacity-50" : ""}>$</span>
												<input required className="inline w-fit p-0 mb-0 bg-transparent outline-none min-w-fit focus:outline-none"
													disabled={isQuoted || part.status == PartStatus.Denied}
													{...register("costInDollars", {
														min: 0
													})}
													placeholder={(part.model.analysisResults ? `${((part.model.analysisResults!.estimatedFilamentUsedInGrams * part.filament!.costPerGramInCents) / 100).toFixed(2)} (Recommended)` : (0).toFixed(2))}
													defaultValue={part.priceInDollars?.toFixed(2)} />

											</>} />

											<div className="my-2 mb-0">
												{isRevoked(part)
													? <></>
													// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
													: <div onClick={() => addForm({
														title: <>Flagging Model: <span className="font-semibold">{part.model.name}</span></>,
														icon: <FontAwesomeIcon icon={faFlag} className="fill-pnw-gold" />,
														description: `Flagging this model will put the request on pause until replaced. An email will be sent to ${request.firstName} asking to email an officer/maintainer.`,
														cancelName: "Cancel",
														submitName: `Flag ${part.model.name}`,
														questions: [
															{
																name: "What issue does the model have?",
																id: "reasonForRevoke",
																type: "textarea",
																placeholder: "e.g., does not meet FDM rules, size exceeds limits, low-inventory, etc.",
																required: true
															}
														],
														onSubmit: async (data) => {
															data.set("partId", part.id.toString());

															addForm(confirmationForm({
																onSubmit: async (_) => {
																	// Handle sending the request.
																	try {
																		const res = await revokePart(data);
																		if (res.success) {
																			if (res.emailSent) {
																				toast.success("Successfully sent warning Email");
																			}
																			else toast.error(`Could not send email to ${request.firstName}`);
																		}
																		return res.success ? null : res.errorMessage ?? "Unknown exception";
																	}
																	catch (ex) {
																		console.error(ex);
																		return "Could not send request to AMS!";
																	}
																},
																onCancel: () => console.warn("Confirmation cancelled"),
																description: `You will be revoking ${part.model.name}, you can undo at anytime!`
															}));

															return null;
														},
													})}>
														<LabelWithIcon classname="button" icon={<FontAwesomeIcon icon={faFlag} />}>Flag Model</LabelWithIcon>
													</div>}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{result && !result.success && <p className="text-red-500 px-2">{result.errorMessage}</p>}
			</form>
		</div>
	);
}


