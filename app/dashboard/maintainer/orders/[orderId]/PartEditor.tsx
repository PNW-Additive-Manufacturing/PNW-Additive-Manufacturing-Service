import { modifyPart, revokePart } from "@/app/api/server-actions/maintainer";
import { FilamentSelector } from "@/app/components/FilamentSelector";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { CurrencyInput } from "@/app/components/Inputs";
import Machine, { getMachineImageURL, MachineData, MachineIndicator } from "@/app/components/Machine";
import ModelViewer from "@/app/components/ModelViewer";
import RefundMessage from "@/app/components/Part/RefundMessage";
import { SelectorStatusPill } from "@/app/components/StatusPill";
import { getSingleColor, NamedSwatch } from "@/app/components/Swatch";
import Image from "next/image";
import { FaRegCopy } from "react-icons/fa6";
import Filament from "@/app/Types/Filament/Filament";
import Part, {
	isRefunded,
	isPriced,
	PartStatus,
	PartWithModel,
	isRevoked,
	getStatusColor,
	isFilamentSupplemented
} from "@/app/Types/Part/Part";
import {
	hasQuote,
	isPaid,
	RequestWithParts
} from "@/app/Types/Request/Request";
import {
	Alert,
	AlertTitle,
	Dialog,
	Fade,
	Slide,
	Snackbar
} from "@mui/material";
import {
	RegularAlarm,
	RegularAlarmClock,
	RegularCloudDownload,
	RegularCrossCircle,
	RegularDownload,
	RegularMoneyProtection,
	RegularPlus,
	RegularReload,
	RegularSpinnerSolid,
	RegularStarFill,
	RegularSthethoscope,
	RegularTimer,
	RegularUpload,
	RegularWeight
} from "lineicons-react";
import { ChangeEvent, ChangeEventHandler, Suspense, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { Color } from "three";
import { string } from "zod";
import { toast } from "react-toastify";

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

export default function PartEditor({
	request,
	part,
	index,
	isQuoted,
	filaments,
	count,
	processingMachine
}: {
	request: RequestWithParts;
	part: PartWithModel;
	index: number;
	isQuoted: boolean;
	filaments: Filament[];
	count: number;
	processingMachine?: MachineData | null;
}) {
	const { register, watch, setValue, getValues } = useForm<{
		costInDollars: number;
		status: string;
		weightOfModel: number;
		reasonForRefund: string;
		refundQuantity: number;
		supplementedFilamentMaterial: string;
		supplementedFilamentColorName: string;
	}>({
		defaultValues:
		{
			costInDollars: part.priceInDollars
		}
	});

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
	const isCostChanged =
		(watch("costInDollars") ?? part.priceInDollars) != part.priceInDollars;
	const isChanged = isEditingFilament || isStatusChanged || isCostChanged;

	const [showFilamentSupplement, setShowFilamentSupplement] = useState(false);
	const [showPartModified, setShowPartModified] = useState(false);
	const [showRevoke, setShowRevoke] = useState(false);
	const [revokeError, revokeFormAction] = useFormState<any, FormData>(
		revokePart,
		""
	);

	let [error, formAction] = useFormState<any, FormData>(
		async (prevState, data) => {
			if (!isStatusChanged) data.delete("status");
			if (!isCostChanged) data.delete("costInDollars");
			if (!isEditingFilament) {
				data.delete("material");
				data.delete("color");
			}

			const action = await modifyPart(prevState, data);
			if (action == undefined || action!.length == 0) toast.success(`Part ${part.model.name} has been successfully modified!`);
			return action;
		},
		""
	);

	const selectedStatusColor = getStatusColor(
		watch("status", part.status) as PartStatus
	);

	return (
		<div key={part.id} className="h-full">
			<PartRevokeForm
				part={part}
				showRevoke={showRevoke}
				setShowRevoke={(show) => {
					setShowRevoke(show);
					setValue("status", PartStatus.Pending);
				}}></PartRevokeForm>
			<form action={formAction} className="h-full">
				<input
					readOnly={true}
					hidden
					value={part.id}
					name="partId"
					id="partId"></input>

				<div className="flex gap-4 w-full h-full">
					<div
						className={`shadow-sm rounded-sm p-4 lg:p-6 w-full bg-white outline outline-2 outline-gray-200`} style={{ borderTopLeftRadius: "0px", borderTopRightRadius: "0px" }}>
						<div className={`lg:flex gap-4`}>
							<div className="w-full">
								{isRefunded(part) ? (
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
								)}

								<div className={count < 3 ? "flex max-lg:flex-col-reverse gap-4" : "w-full flex gap-4 flex-col-reverse"}>
									<div className={`flex items-start gap-4 ${count > 2 ? "w-full" : "lg:w-1/3"}`}>
										<div className="w-full h-full out">
											<div className="w-full h-36 out bg-gray-50 rounded-sm">
												<ModelViewer
													isAvailable={!part.model.isPurged}
													modelSize={part.model?.fileSizeInBytes}
													// swatch={
													// 	part.supplementedFilament
													// 		?.color ??
													// 	part.filament?.color
													// }
													modelURL={`/api/download/model?modelId=${part.modelId}`}></ModelViewer>
											</div>
											<div>
												<div className="bg-background text-gray-500 w-full p-3 text-xs rounded-b-sm">
													<div className="flex gap-2 flex-wrap justify-between items-center">
														{part.model.analysisResults
															? <>
																<div className="w-fit gap-2 fill-gray-500">
																	<span className="mr-2">Analysis</span><RegularAlarmClock className="inline mb-0.5" /> {part.model.analysisResults.estimatedDuration}<RegularWeight className="ml-2 inline mb-0.5" /> {part.model.analysisResults.estimatedFilamentUsedInGrams} Grams
																</div>
															</>
															: part.model.analysisFailedReason
																? <>
																	<p className="text-red-600 fill-red-600">{part.model.analysisFailedReason}</p>
																</>
																: <p className="text-gray-500">Queued for Analysis</p>}

														{!part.model.isPurged && <a className={`text-gray-500 fill-gray-500 hover:text-black hover:fill-black text-nowrap`}
															href={part.model.isPurged ? undefined : `/api/download/model?modelId=${part.modelId}`}
															download={`${part.model.name}.stl`}
															target="_blank">
															Download
															<RegularDownload className="ml-2 inline mb-0.5 fill-inherit"></RegularDownload>
														</a>}

													</div>
													{part.status == PartStatus.Printing && processingMachine && <div className="flex items-end gap-2 w-full mt-2 text-xs text-gray-500">
														<div className="flex gap-2 items-center w-full" style={{ borderBottomRightRadius: "0px", borderBottomLeftRadius: "0px" }}>
															<span className="xl:text-nowrap">Printing on {processingMachine.identifier} ({processingMachine.model})</span>
															<span className="max-xl:hidden">{processingMachine.progress}%</span>
															<progress className="colored max-xl:hidden h-2 opacity-75" value={processingMachine.progress} max={100}></progress>
														</div>
													</div>}
													{/* <div className="flex items-end gap-2 w-full mt-2 text-xs text-gray-500">
														<div className="flex gap-2 items-center w-full" style={{ borderBottomRightRadius: "0px", borderBottomLeftRadius: "0px" }}>
															<span className="xl:text-nowrap">Printing on Sam (X1C)</span>
															<span className="max-xl:hidden">75%</span>
															<progress className="colored max-xl:hidden h-2 opacity-75" value={75} max={100}></progress>
														</div>
													</div> */}
												</div>
											</div>
										</div>
									</div>
									<div>
										<div className="flex flex-wrap gap-x-2 gap-y-2 items-center mb-2 ">
											<SelectorStatusPill
												className={count > 3 ? "2xl:w-full" : ""}
												register={register("status", {
													onChange: (
														ev: ChangeEvent<HTMLSelectElement>
													) => {
														if (
															ev.currentTarget
																.value ==
															PartStatus.Denied
														) {
															setShowRevoke(true);
														}
													}
												})}
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
											<div className="text-lg text-wrap hover:fill-pnw-gold hover:text-pnw-gold hover:cursor-pointer" onClick={() => {
												navigator.clipboard
													.writeText(part.model.name)
													.then(() => toast.success(`Part copied to clipboard!`, { autoClose: 1000 }));
											}}>
												{part.model.name}
												{/* <FaRegCopy className="inline fill-inherit mb-1" style={{ padding: "3px" }}></FaRegCopy> */}
											</div>
											{isChanged && <button
												className={`w-fit text-xs px-0 py-0 text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold enabled:animate-pulse`}
												disabled={!isChanged || request.isFulfilled}>
												<RegularUpload className="p-0.5 w-5 h-5 inline"></RegularUpload>
												<span className="ml-2 text-inherit">
													Save
												</span>
											</button>}
										</div>
										<div className="text-sm">
											<p className="my-0.5">
												<span className="font-light">
													{"Manufacturing Process: "}
												</span>
												{part.filament?.technology}
											</p>

											<div className="my-0.5">
												{part.supplementedFilament !=
													undefined ? (
													<>
														<span className="font-light mr-1">
															{
																"Supplemented Filament:"
															}
														</span>
														{`${part.filament!.material.toUpperCase()} `}
														<NamedSwatch
															swatch={
																part.filament!.color
															}></NamedSwatch>
														<span>{" with"}</span>
														{` ${part.supplementedFilament.material.toUpperCase()} `}
														<NamedSwatch
															swatch={
																part
																	.supplementedFilament
																	.color
															}></NamedSwatch>
													</>
												) : showFilamentSupplement ? (
													<div className="flex">
														<div className="font-light mr-1">
															{
																"Supplementing Filament:"
															}
														</div>
														<FilamentSelector
															defaultColor={
																part.filament?.color
															}
															defaultMaterial={
																part.filament
																	?.material
															}
															onChange={(
																material,
																colorName
															) => {
																setValue(
																	"supplementedFilamentMaterial",
																	material
																);
																setValue(
																	"supplementedFilamentColorName",
																	colorName
																);
															}}
															includeSwatchVisual={
																false
															}
															filaments={
																filaments
															}></FilamentSelector>
													</div>
												) : (
													<>
														<span className="font-light">
															{"Filament: "}
														</span>
														{part.filament ==
															undefined ? (
															<>No longer Available</>
														) : (
															<>
																{`${part.filament.material.toUpperCase()} `}
																<NamedSwatch swatch={part.filament.color} />
															</>
														)}
														{/* {watch(
														"status",
														part.status
													) == PartStatus.Pending && (
														<span
															className="text-pnw-gold hover:cursor-pointer text-sm ml-2"
															onClick={() =>
																setShowFilamentSupplement(
																	true
																)
															}>
															{
																"Supplement Filament"
															}
														</span>
													)} */}
													</>
												)}
											</div>

											<div className="my-0.5">
												<span className="font-light">
													{"Quantity: "}
												</span>
												x{part.quantity}
											</div>

											<div className="my-0.5">
												<span className="font-light">
													{"Cost per-unit: "}
												</span>
												<span className={(getValues("costInDollars") == undefined || getValues("costInDollars").toString() == "") ? "opacity-50" : ""}>$</span>
												<input required className="inline w-fit p-0 mb-0 bg-transparent outline-none min-w-fit focus:outline-none"
													disabled={isQuoted}
													{...register("costInDollars", {
														min: 0
													})}
													placeholder={(part.model.analysisResults ? `${((part.model.analysisResults!.estimatedFilamentUsedInGrams * part.filament!.costPerGramInCents) / 100).toFixed(2)} (Recommended)` : (0).toFixed(2))}
													defaultValue={part.priceInDollars} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{isRevoked(part) && (
							<Alert severity="warning">
								Request Revoked {part.deniedReason}
							</Alert>
						)}
					</div>
				</div>
				{error && <p className="text-red-500 px-2">{error}</p>}
			</form>
		</div>
	);
}
