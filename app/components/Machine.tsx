"use client";

import {
	faCheckCircle
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useActionState } from "react";
import { markAsEmpty } from "../api/farm/FarmActions";
import AMImage from "./AMImage";
import FormLoadingSpinner from "./FormLoadingSpinner";

export interface MachineData {
	model: string;
	identifier: string;
	filename?: string;
	printStage?: number;
	layerNumber?: number;
	filaments: ({ color: string; material: string } & (
		| { location: "External" }
		| { location: "AMS"; slot: number }
	))[];
	isHealthy: boolean;
	status: string;
	failReason: string;
	progress: number;
	timeRemaining: string;
}

export function isBusy(machine: MachineData) {
	return machine && (machine.status == "Printing" || machine.status == "Preparing" || machine.status == "Unknown" || machine.status == "Paused");
}

export function getMachineImageURL(model: string): string {
	switch (model) {
		case "X1":
			return "/assets/Bambu Lab X1_cover.png";
		case "X1C":
			return "/assets/Bambu Lab X1 Carbon_cover.png";
		case "X1E":
			return "/assets/Bambu Lab X1E_cover.png";
		case "P1S":
			return "/assets/Bambu Lab P1S_cover.png";
		case "P1P":
			return "/assets/Bambu Lab P1P_cover.png";
		case "A1M":
			return "/assets/Bambu Lab A1 mini_cover.png";
		case "A1":
			return "/assets/Bambu Lab A1_cover.png";
		case "Mars 4 Ultra":
			return "/assets/mars4ultra.jpg"
		default:
			// TODO: Replace with an unknown printer cover photo.
			return "/assets/Bambu Lab X1_cover.png";
	}
}

export function MachineIndicator(machinedData: MachineData) {

	return (
		<>
			<div
				style={{ backgroundColor: "#efefef" }}
				className="rounded-md flex flex-col justify-between">
				<div className="w-full h-full">
					<AMImage
						src={getMachineImageURL(machinedData.model)}
						alt={`${machinedData.model} cover`}
						width={180}
						height={180}
						className="rounded-lg" />
				</div>
				{(machinedData.identifier ?? machinedData.model) != "" && <div>
					<p className="text-center text-sm font-medium m-0 p-0 pb-2 mb-1 text-wrap px-1">
						{machinedData.identifier ?? machinedData.model}
					</p>
				</div>}
			</div>
		</>
	);
}

export default function Machine(
	machinedData: MachineData & { onUpdate?: () => void }
) {
	// Status transformation for user-richness.
	let userFacingStatus = machinedData.status;
	if (userFacingStatus == "Printed") userFacingStatus = "Completed";
	if (userFacingStatus == "Idle") userFacingStatus = "Inactive";

	let showMarkedButton =
		machinedData.status == "Printed" || machinedData.status == "Error";
	let showStopButton =
		machinedData.status == "Printing" || machinedData.status == "Preparing";
	let showControls = showMarkedButton;

	const [markAsEmptyState, markAsEmptyForm] = useActionState(markAsEmpty, null);

	return (
		<>
			<div
				// className={`p-4 bg-white outline outline-2 outline-gray-200 lg:flex gap-4 w-full relative mb-3.5 ${
				// 	showControls && "pb-7"
				// }`}>
				className={`p-4 bg-white outline outline-2 outline-gray-200 lg:flex gap-4 w-full relative shadow-sm`}>
				<div className="flex gap-2">
					<div className="h-32 w-32">
						<MachineIndicator {...machinedData}></MachineIndicator>
					</div>
					<div className="flex gap-1.5 h-fit">
						{machinedData.filaments != undefined &&
							machinedData.filaments.length > 0 ? (
							<>
								<div
									className={`h-full flex flex-col gap-1.5 px-2 py-1.5 rounded-md pb-3 border-2 border-gray-300 border-opacity-50`}
								// style={{ backgroundColor: "#efefef" }}
								>
									<p className="text-xs text-gray-600 text-center">
										{machinedData.filaments.at(0)
											?.location == "AMS"
											? "AMS"
											: "EXTRN"}
									</p>
									{machinedData.filaments.map((f) => (
										<div
											className={`border-b-3 opacity-75 border-gray-200 py-0.5 min-w-10 text-center w-full text-xs font-normal text-black`}
											style={{
												borderColor: `#${f.color.substring(
													0,
													f.color.length - 2
												)}`
											}}>
											<span className="text-nowrap">
												{f.material}
											</span>
										</div>
									))}
								</div>
							</>
						) : (
							<></>
							// <p
							// 	style={{ writingMode: "sideways-lr" }}
							// 	className="text-center text-sm font-light">
							// 	Filament Empty
							// </p>
						)}
						{/* {showMarkedButton && (
							<div
								className={`flex justify-center items-center gap-1.5 rounded-md py-3 border-2 border-gray-300 border-opacity-50`}>
								<RegularCheckmarkCircle className="fill-cool-black"></RegularCheckmarkCircle>
							</div>
						)} */}
					</div>
				</div>
				<div className="max-lg:mt-1 text-sm py-2 text-wrap flex flex-col gap-4 overflow-hidden w-full">
					<div className="block">
						<div className="flex justify-between items-center mb-1">
							<p className="font-semibold text-base pt-0 mt-0">
								{userFacingStatus}
								{userFacingStatus == "Error" && (
									<span>
										{" "}
										{machinedData.failReason ?? "unknown"}
									</span>
								)}
							</p>
							{/* {showMarkedButton && (
									<div className="flex items-center gap-1 text-cool-black fill-cool-black">
										Plate Cleared
										<RegularCheckmarkCircle className="w-5 h-5 p-0.5 fill-inherit"></RegularCheckmarkCircle>
									</div>
								)} */}
						</div>
						<span className="text-wrap w-full">
							{machinedData.filename && machinedData.filename}
						</span>
					</div>

					<div className="w-full">
						{machinedData.status == "Printing" && (
							<>
								<div className="flex gap-4 items-end">
									<div className="w-full">
										<div className="flex justify-between gap-4 items-end">
											<p className="text-nowrap text-lg text-pnw-gold font-bold mb-0">
												{machinedData.progress}%
											</p>
											<p>
												{machinedData.layerNumber}{" "}
												{machinedData.timeRemaining}m
											</p>
										</div>
										<progress
											className="w-full colored"
											value={machinedData.progress}
											max={100}></progress>
									</div>
								</div>
							</>
						)}
						<p>
							{!machinedData.isHealthy && (
								<span className="text-red-600 mt-2">
									Disconnected
								</span>
							)}
						</p>

						{showMarkedButton && (
							<form
								action={async (formData) => {
									console.log(
										await markAsEmptyForm(formData)
									);
									if (machinedData.onUpdate)
										machinedData.onUpdate();
									// setTimeout(() => {}, 1000);
								}}>
								<input
									hidden
									readOnly
									name="identity"
									id="identity"
									value={machinedData.identifier}></input>
								<button className="bg-white border-2 border-solid border-gray-200 text-black fill-cool-black px-2 py-1.5 flex items-center gap-1.5 w-fit mb-0 hover:fill-white">
									<FontAwesomeIcon icon={faCheckCircle} className="fill-inherit w-3.5 h-3.5"></FontAwesomeIcon>
									<span className="text-xs font-light">
										Plate Cleared
									</span>
									<FormLoadingSpinner></FormLoadingSpinner>
								</button>
							</form>
						)}
					</div>
					{/* 
					{showMarkedButton && (
						<form
							action={async (formData) => {
								console.log(await markAsEmptyForm(formData));
								if (machinedData.onUpdate)
									machinedData.onUpdate();
								setTimeout(() => {}, 1000);
							}}>
							<input
								hidden
								readOnly
								name="identity"
								id="identity"
								value={machinedData.identifier}></input>
							<button className="bg-white border-2 border-solid border-gray-200 text-black fill-cool-black px-2 py-1.5 flex items-center gap-1.5 w-fit mb-0 hover:fill-white">
								<RegularCheckmarkCircle className="fill-inherit"></RegularCheckmarkCircle>
								<span className="text-sm font-light">
									Plate Cleared
								</span>
							</button>
						</form>
					)} */}
				</div>

				<div className="absolute left-4 -bottom-4 mt-0.5 flex gap-4 justify-end w-full pr-8">
					{/* <form
						action={async (formData) => {
							console.log(await markAsEmptyForm(formData));
							if (machinedData.onUpdate) machinedData.onUpdate();
							setTimeout(() => {}, 1000);
						}}>
						<input
							hidden
							readOnly
							name="identity"
							id="identity"
							value={machinedData.identifier}></input>
						<button
							disabled={!showStopButton}
							className="bg-white border-2 border-solid border-gray-200 text-black fill-cool-black px-2 py-1.5 flex items-center gap-1.5 w-fit mb-0 hover:text-red-500 hover:fill-red-500">
							<RegularCrossCircle className="fill-inherit"></RegularCrossCircle>
							<span className="text-sm font-light">Cancel</span>
						</button>
					</form> */}
					{/* <form
						action={async (formData) => {
							console.log(await markAsEmptyForm(formData));
							if (machinedData.onUpdate) machinedData.onUpdate();
							setTimeout(() => {}, 1000);
						}}>
						<input
							hidden
							readOnly
							name="identity"
							id="identity"
							value={machinedData.identifier}></input>
						<button
							disabled={!showMarkedButton}
							className="bg-white border-2 border-solid border-gray-200 text-black fill-cool-black px-2 py-1.5 flex items-center gap-1.5 w-fit mb-0 hover:fill-white">
							<RegularCheckmarkCircle className="fill-inherit"></RegularCheckmarkCircle>
							<span className="text-sm font-light">
								Plate Cleared
							</span>
						</button>
					</form> */}
				</div>
			</div>
		</>
	);
}
