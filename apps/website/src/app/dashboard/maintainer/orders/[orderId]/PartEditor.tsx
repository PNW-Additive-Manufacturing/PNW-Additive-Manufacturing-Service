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
				<div className="p-6">
					<h2 className="text-2xl font-light mb-2">
						Submit issues for {part.model.name}?
					</h2>
					<br />
					<form action={revokeFormAction}>
						<input
							type="number"
							name="partId"
							id="partId"
							readOnly
							value={part.id}
							hidden
						/>

						<label>DFM Violations</label>
						<select
							className="mt-2 border-l-4 border-l-pnw-gold"
							name="dfm"
							id="dfm"
							multiple>
							<option value="hollow">Confined Hollow</option>
							<option value="floating">Floating Parts</option>
							<option value="too_big">Too Large</option>
						</select>

						<label>Other Comments</label>
						<textarea
							className="w-full mt-2"
							name="reasonForRevoke"
							placeholder="References to resolve selected issue."
							required
						/>
						<button className="mb-0">Deny Model</button>
						<span className="text-red-600">{revokeError}</span>
					</form>
				</div>
			</Dialog>
		</>
	);
}

export default function PartEditor({
	request,
	part,
	index,
	isQuoted,
	filaments
}: {
	request: RequestWithParts;
	part: PartWithModel;
	index: number;
	isQuoted: boolean;
	filaments: Filament[];
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
						<div className="max-lg:hidden w-fit text-lg text-center">
							{index + 1}
							<button
								className={`flex flex-col p-0 mt-1 text-sm text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold`}
								disabled={!isChanged}>
								<RegularUpload className="w-6 h-6 inline"></RegularUpload>
								<FormLoadingSpinner className="w-6 h-auto mt-2" />
							</button>
						</div>
						<div className="w-full">
							<div className="lg:flex">
								<div className="mr-4 mb-2 lg:max-w-44 w-full">
									<div className="w-full h-40 lg:h-48 outline-gray-300 bg-gray-50 outline-1 outline rounded-sm relative shadow-sm">
										<ModelViewer
											swatch={
												part.supplementedFilament
													?.color ??
												part.filament?.color
											}
											modelURL={`/api/download/model?modelId=${part.modelId}`}></ModelViewer>
									</div>
									<a
										className="flex py-1 px-1.5 text-xs text-nowrap justify-between items-center opacity-50 hover:opacity-100"
										href={`/api/download/model?modelId=${part.modelId}`}
										download={`${part.model.name}.stl`}
										target="_blank">
										Download (
										{`${Math.round(
											part.model.fileSizeInBytes / 1000
										)} kB`}
										)
										<RegularCloudDownload className="fill-cool-black w-6 h-6 p-0.5"></RegularCloudDownload>
									</a>
								</div>

								<div className="w-full">
									<div className="w-full flex">
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
											<option
												value={PartStatus.Pending}
												key={PartStatus.Pending}>
												Pending
											</option>
											{!isPriced(part) && (
												<option
													value={PartStatus.Denied}
													key={PartStatus.Denied}>
													Denied
												</option>
											)}
											{isPaid(request) && (
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
										<button
											className={`lg:hidden p-1 text-sm mr-2 text-cool-black hover:text-cool-black mb-0 bg-transparent hover:bg-transparent hover:fill-black enabled:fill-pnw-gold enabled:text-pnw-gold enabled:animate-pulse`}
											disabled={!isChanged}>
											<RegularUpload className="w-5 h-5 inline"></RegularUpload>
											<span className="ml-2 text-inherit">
												Save
											</span>
											<FormLoadingSpinner className="inline h-5 w-auto ml-2" />
										</button>
										<span className="text-2xl w-full text-wrap max-lg:hidden">
											{part.model.name} x{part.quantity}
										</span>
									</div>
									<div className="text-2xl lg:hidden text-wrap mb-2">
										{part.model.name} [STL] x{part.quantity}
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
												{"Profile: "}
											</span>
											High Quality (0.12mm)
										</p>
										<p className="my-0.5">
											<span className="font-light">
												{"Comment: "}
											</span>
											{"No comment provided."}
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
														<Suspense
															fallback={
																<div>
																	Loading...
																</div>
															}>
															{`${part.filament.material.toUpperCase()} `}
															<NamedSwatch
																swatch={
																	part
																		.filament
																		.color
																}></NamedSwatch>
														</Suspense>
													)}
													{watch(
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
													)}
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
							</div>

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
				</div>

				{error && <p className="text-red-500 px-2">{error}</p>}
			</form>
		</div>
	);
}
