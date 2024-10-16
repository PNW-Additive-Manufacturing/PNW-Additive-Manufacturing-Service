import { modifyPart, revokePart } from "@/app/api/server-actions/maintainer";
import { FilamentSelector } from "@/app/components/FilamentSelector";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { CurrencyInput } from "@/app/components/Inputs";
import ModelViewer from "@/app/components/ModelViewer";
import RefundMessage from "@/app/components/Part/RefundMessage";
import { SelectorStatusPill } from "@/app/components/StatusPill";
import { getSingleColor, NamedSwatch } from "@/app/components/Swatch";
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
	RegularCloudDownload,
	RegularCrossCircle,
	RegularSpinnerSolid,
	RegularUpload
} from "lineicons-react";
import { ChangeEvent, ChangeEventHandler, Suspense, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { Color } from "three";
import { string } from "zod";

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
	count
}: {
	request: RequestWithParts;
	part: PartWithModel;
	index: number;
	isQuoted: boolean;
	filaments: Filament[];
	count: number;
}) {
	const { register, watch, setValue } = useForm<{
		costInDollars: number;
		status: string;
		weightOfModel: number;
		reasonForRefund: string;
		refundQuantity: number;
		supplementedFilamentMaterial: string;
		supplementedFilamentColorName: string;
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
			console.log(data, watch("supplementedFilamentColorName"));
			if (!isStatusChanged) data.delete("status");
			if (!isCostChanged) data.delete("costInDollars");
			if (!isEditingFilament) {
				data.delete("material");
				data.delete("color");
			}

			const action = await modifyPart(prevState, data);
			if (action == undefined || action!.length == 0)
				setShowPartModified(true);
			return action;
		},
		""
	);

	const selectedStatusColor = getStatusColor(
		watch("status", part.status) as PartStatus
	);

	return (
		<div key={part.id}>
			<PartRevokeForm
				part={part}
				showRevoke={showRevoke}
				setShowRevoke={(show) => {
					setShowRevoke(show);
					setValue("status", PartStatus.Pending);
				}}></PartRevokeForm>
			<Snackbar
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				open={showPartModified}
				onClose={() => setShowPartModified(false)}
				autoHideDuration={3500}
				TransitionComponent={Slide}
				className="max-lg:mb-5">
				<Alert
					severity="info"
					variant="filled"
					sx={{ width: "100%", borderRadius: "12px" }}>
					Part {part.model && `${part.model.name} `}was successfully
					updated!
				</Alert>
			</Snackbar>
			<form action={formAction}>
				<input
					readOnly={true}
					hidden
					value={part.id}
					name="partId"
					id="partId"></input>
				<div
					className={`shadow-sm rounded-sm p-4 lg:p-6 bg-white outline outline-2 outline-gray-200`}>
					<div className={`lg:flex gap-4`}>
						{/* <div className="max-lg:hidden w-fit text-lg text-center">
							{index + 1}
							<button
								className={`flex flex-col p-0 mt-1 text-sm text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold`}
								disabled={!isChanged}>
								<RegularUpload className="w-6 h-6 inline"></RegularUpload>
								<FormLoadingSpinner className="w-6 h-auto mt-2" />
							</button>
						</div> */}
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

							<div className={count < 3 ? "lg:flex" : ""}>
								<div className="w-full">
									<div className="w-full flex items-center mb-1">
										<SelectorStatusPill
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
											className="mr-2"
											statusColor={selectedStatusColor}
											defaultValue={part.status}>
											{part.status !=
												PartStatus.Denied && (
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
										<div className="text-2xl text-wrap">
											{part.model.name} x{part.quantity}
										</div>
										<button
											className={`w-fit text-sm ml-4 px-0 py-0 text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold enabled:animate-pulse`}
											disabled={!isChanged || request.isFulfilled}>
											<RegularUpload className="p-0.5 w-5 h-5 inline"></RegularUpload>
											<span className="ml-2 text-inherit">
												Save
											</span>
											{/* <FormLoadingSpinner className="ml-2" /> */}
										</button>
									</div>
									<div>
										<p className="my-0.5">
											<span className="font-light">
												{"Technology: "}
											</span>
											Fused Deposition Modeling
										</p>
										<p className="my-0.5">
											<span className="font-light">
												{"Automatic Analysis: "}
											</span>
											{part.model.analysisResults ? (
												<>
													<>
														{
															part.model
																.analysisResults!
																.estimatedFilamentUsedInGrams
														}{" "}
														(g)
													</>
													<>
														{
															part.model
																.analysisResults!
																.estimatedDuration
														}
													</>
												</>
											) : part.model
												.analysisFailedReason ? (
												<>
													Failed due to{" "}
													{
														part.model
															.analysisFailedReason
													}
													!
												</>
											) : (
												<>None performed.</>
											)}
										</p>
										{/* <p className="my-0.5">
											<span className="font-light">
												{"Profile: "}
											</span>
											Standard
										</p> */}
										{/* <p className="my-0.5">
											<span className="font-light">
												{"Comment: "}
											</span>
											{"No comment provided."}
										</p> */}

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
										<div className="w-full md:max-w-60 mt-2">
											{watch("status", part.status) ==
												"pending" && (
													<CurrencyInput
														defaultValue={
															part.priceInDollars ?? 0
														}
														register={register(
															"costInDollars",
															{
																min: 0,
																disabled: isQuoted
															}
														)}
														id={
															"costInDollars"
														}></CurrencyInput>
												)}
										</div>
									</div>
								</div>
								<div className={count > 2 ? "mt-6 w-auto" : "w-96"}>
									<div className="w-full h-40 lg:h-48 outline-gray-300 bg-gray-50 outline-1 outline rounded-sm relative shadow-sm">
										<ModelViewer
											swatch={
												part.supplementedFilament
													?.color ??
												part.filament?.color
											}
											modelURL={`/api/download/model?modelId=${part.modelId}`}></ModelViewer>
									</div>
									<div className="py-1 px-1 mt-1">
										{part.model.analysisResults && (
											<div className="bg-pnw-gold w-full rounded-md text-xs px-2 py-1">
												<p>Analysis Completed</p>
												<p>
													{
														part.model
															.analysisResults
															.estimatedDuration
													}
												</p>
												<p>
													{
														part.model
															.analysisResults
															.estimatedFilamentUsedInGrams
													}{" "}
													(g)
												</p>
											</div>
										)}
										<a
											className="flex text-xs text-nowrap justify-between items-center opacity-50 hover:opacity-100"
											href={`/api/download/model?modelId=${part.modelId}`}
											download={`${part.model.name}.stl`}
											target="_blank">
											Download (
											{`${Math.round(
												part.model.fileSizeInBytes /
												1000
											)} kB`}
											)
											<RegularCloudDownload className="fill-cool-black w-6 h-6 p-0.5"></RegularCloudDownload>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-2">
						<RefundMessage part={part}></RefundMessage>
					</div>
					{isRevoked(part) && (
						<Alert severity="warning">
							Request Revoked {part.deniedReason}
						</Alert>
					)}

					<div></div>
				</div>

				{error && <p className="text-red-500 px-2">{error}</p>}
			</form>
		</div>
	);
}
