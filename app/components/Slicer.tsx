import { useForm } from "react-hook-form";
import ThreeModelViewer from "./ThreeModelViewer";
import Filament from "../Types/Filament/Filament";
import PopupFilamentSelector from "./PopupFilamentSelector";
import { useState } from "react";
import { Input } from "./Input";
import { useFormState } from "react-dom";
import { slice, uploadToFarm } from "../api/farm/FarmActions";
import FormLoadingSpinner from "./FormLoadingSpinner";

export interface SlicingOptions {
	quantity: number;
	infillPercentage: number;
	useSupports: boolean;
	supportStyle?: string;
	wallCount: number;
	layerHeight: number;
}

export interface SlicerOptions {
	modelFile: File;
	onUpload?: (options: SlicingOptions) => void;
}

export default function Slicer(
	options: SlicerOptions & { filaments: Filament[] }
) {
	const [filament, setFilament] = useState<Filament | undefined>(undefined);
	const { register, watch, getValues, handleSubmit } = useForm<{
		infillPercentage: number;
		useSupports: boolean;
		supportStyle?: string;
		wallCount: number;
		quantity: number;
		layerHeight: number;
	}>();

	console.log(filament);

	const [sliceReq, sliceForm] = useFormState(slice, null);
	const [sendReq, sendForm] = useFormState(uploadToFarm, null);

	console.error(sendReq);

	return (
		<form
			action={(data) => {
				console.log(data);
				data.set("colorHex", data.get("colorHex")!.slice(1));
				data.set("file", options.modelFile);
				if (sliceReq) {
					sendForm(data);
				} else {
					sliceForm(data);
				}
			}}>
			<div className="bg-white outline outline-2 outline-gray-200 p-4 w-fit shadow-sm">
				<div className="flex gap-8 h-full w-fit">
					{/* Slicing Options */}
					<div>
						<div
							className="mb-4 rounded-md relative"
							style={{ width: "100%", height: "200px" }}>
							<ThreeModelViewer
								modelFile={options.modelFile}
								swatch={filament?.color}></ThreeModelViewer>
							<div className="top-4 left-4 absolute">
								<div className="gap-4 pb-6 text-lg flex justify-end items-center">
									{/* <RegularFiles></RegularFiles> */}
								</div>
							</div>
						</div>

						<div className="px-2">
							<div
								className="overflow-scroll w-full px-1"
							// style={{ maxHeight: "400px" }}
							>
								<label className="mb-2">
									Slicing {options.modelFile.name}
								</label>
								<PopupFilamentSelector
									showDescription={false}
									filaments={options.filaments}
									onChange={(newFilament) => {
										setFilament(newFilament);
									}}></PopupFilamentSelector>
								<Input
									label={
										"Quantity - Copies on a single plate."
									}
									type={"number"}
									id={"quantity"}
									defaultValue={"1"}
									{...register("quantity")}></Input>
								{/* <label>Supports</label> */}
								<div className="flex gap-4">
									<div>
										<label className="text-nowrap">
											Supports
										</label>
										<input
											className="h-5 m-auto border-none outline-none mt-5"
											defaultChecked={true}
											{...register("useSupports")}
											type="checkbox"></input>
									</div>
									<div className="w-full">
										<label>Style</label>
										<select
											disabled={!watch("useSupports")}
											{...register("supportStyle")}
											defaultValue={"tree(auto)"}>
											<option
												disabled={!watch("useSupports")}
												value="tree(auto)">
												Tree
											</option>
											<option
												disabled={!watch("useSupports")}
												value="normal(auto)">
												Normal
											</option>
										</select>
									</div>
								</div>
								<label>Infill Percentage</label>
								<input
									{...register("infillPercentage")}
									min={5}
									defaultValue={15}
									max={100}></input>
								<label>
									Layer Height - Distance between each layer
								</label>
								<select
									{...register("layerHeight")}
									defaultValue={0.2}>
									<option value={0.2}>0.2mm</option>
									<option value={0.16}>0.16mm</option>
									<option value={0.08}>0.08mm</option>
								</select>
								<label>Walls</label>
								<input
									type="number"
									min={1}
									defaultValue={3}
									{...register("wallCount")}></input>
							</div>
							<div className="mt-4">
								<div>
									<div className="py-4 px-6 outline outline-2 outline-gray-200 text-sm">
										{sliceReq ? (
											sliceReq.success ? (
												<>
													<p>
														Duration:{" "}
														{Math.round(
															sliceReq.durationAsSeconds! /
															60
														)}{" "}
														minutes
													</p>
												</>
											) : (
												<>
													An issue occurred Slicing!{" "}
													{sliceReq.message}
												</>
											)
										) : (
											<>Model has not been Sliced.</>
										)}
									</div>
								</div>

								<div className="flex gap-4 mt-4">
									<button
										disabled={
											sliceReq != null && sliceReq.success
										}
										className="w-full flex gap-4 items-center"
										type="submit">
										Slice
										<FormLoadingSpinner />
									</button>
									<button
										className="w-fit flex gap-4"
										type="submit"
										disabled={sliceReq == null}>
										Send to Farm
										<FormLoadingSpinner className="fill-white" />
									</button>
								</div>
							</div>
						</div>
					</div>
					{/* <div
						className="h-full w-full bg-gray-50 rounded-xl outline outline-2 outline-gray-200 relative p-2"
						style={{ height: "auto" }}>
						<div className="rounded-xl" style={{ height: "100%" }}> */}
					{/* <ModelViewer
								modelFile={options.modelFile}
								swatch={filament?.color}></ModelViewer> */}
					{/* </div>

						<div>
							<div className="absolute left-4 bottom-4 bg-white rounded-md py-4 px-6 outline outline-2 outline-gray-200 ">
								Rotation: (0, 0, 0)
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</form>
	);
}
