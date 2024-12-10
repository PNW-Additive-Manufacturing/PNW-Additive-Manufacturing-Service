"use client";

import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { addFilament } from "@/app/api/server-actions/maintainer";
import { useState } from "react";
import { SwatchConfiguration } from "@/app/components/Swatch";
import { CurrencyInput } from "@/app/components/Inputs";

export function FilamentForm() {
	let [material, setMaterial] = useState("");
	let [colorName, setColorName] = useState("");
	const [colorType, setColorType] = useState<"mono" | "gradient">("mono");

	let action = async (prevState: string, formData: FormData) => {
		console.log(formData);
		let result = await addFilament(prevState, formData);
		if (result.error) {
			return result.error;
		}

		setMaterial("");
		setColorName("");
		return "";
	};

	return (
		<GenericFormServerAction
			serverAction={action}
			submitName="Add Filament"
			submitPendingName="Adding Filament...">
			<div className="flex gap-4">
				<button
					className="bg-pnw-gold text-black"
					disabled={colorType == "mono"}
					onClick={() => setColorType("mono")}>
					Single Color
				</button>
				<button
					className="bg-gradient-linear-pnw-mystic text-black"
					disabled={colorType == "gradient"}
					onClick={() => setColorType("gradient")}>
					Gradient Color
				</button>
			</div>

			{colorType == "mono" ? (
				<input
					title="Color"
					type="color"
					name="filament-mono-color"
					id="filament-mono-color"
				/>
			) : (
				<>
					<input
						title="ColorA"
						type="color"
						name="filament-di-colorA"
						id="filament-di-colorA"
					/>
					<input
						title="ColorB"
						type="color"
						name="filament-di-colorB"
						id="filament-di-colorB"
					/>
				</>
			)}

			<Input
				type="text"
				id="filament-material"
				label="Filament Material"
				placeholder="PLA, PETG, & More"
				value={material}
				required={true}
				onChange={(e) => {
					setMaterial(e.target.value);
				}}
			/>
			<Input
				type="text"
				id="filament-colorName"
				label="Filament Color Name"
				placeholder="White, Black, Red & More"
				value={colorName}
				required={true}
				onChange={(e) => {
					setColorName(e.target.value);
				}}
			/>

			<label>Cost per Gram</label>
			<div className="mb-4">
				<CurrencyInput
					id="filament-material-cost"
					key="filament-material-cost"
				/>
			</div>

			<Input
				type="number"
				id="filament-lead-time-in-days"
				label="Lead Time in Days"
				placeholder="1" />

			<Input
				type="text"
				id="filament-technology"
				label="Technology"
				placeholder="FDM, Resin, Metal FFF"
				required={true} />

			<label>Details</label>
			<textarea
				id="filament-details"
				name="filament-details"
				required
				placeholder="Rigid, UV-Resistant, Flexible"></textarea>
		</GenericFormServerAction>
	);
}
