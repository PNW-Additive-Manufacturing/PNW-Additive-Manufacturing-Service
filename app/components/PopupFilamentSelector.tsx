"use client";

import { useForm } from "react-hook-form";
import { Input } from "./Input";
import Filament from "../Types/Filament/Filament";
import { getSingleColor, Swatch } from "./Swatch";
import { useDebounce } from "react-use";
import { Label } from "./Inputs";
import FilamentBlock from "../experiments/FilamentBlock";
import { useState } from "react";

export default function PopupFilamentSelector({
	filaments,
	onChange,
	defaultFilament,
	showDescription
}: {
	filaments: Filament[];
	defaultFilament?: { material?: string; colorName?: string };
	onChange?: (chosenFilament: Filament) => void;
	showDescription?: boolean;
}) {
	showDescription = showDescription ?? true;

	const [filament, setFilament] = useState<Filament | undefined>(undefined);

	const materials: string[] = [];
	for (let filament of filaments) {
		const isExisting =
			materials.find((material) => material == filament.material) !=
			undefined;

		if (!isExisting) materials.push(filament.material);
	}

	const isAnyAvailable = materials.length > 0;

	const { register, watch, trigger, setValue } = useForm<{
		material: string;
		colorName: string;
		colorHex: string;
	}>({
		defaultValues: {
			colorName: defaultFilament?.colorName,
			material: defaultFilament?.material
		}
	});

	const selectedMaterial = watch("material");
	const filamentsMatchingMaterial = filaments.filter(
		(filament) => filament.material == selectedMaterial
	);
	const selectedColorName = watch("colorName");
	const selectedFilament = filaments.find(
		(filament) =>
			filament.material == selectedMaterial &&
			filament.color.name == selectedColorName
	);

	function changeFilament(material?: string, colorName?: string) {
		const m__selectedFilament = filaments.find(
			(filament) =>
				filament.material == (material ?? selectedMaterial) &&
				filament.color.name == (colorName ?? selectedColorName)
		);

		if (material != null) {
			setValue("material", material);
		}
		if (colorName != null) {
			setValue("colorName", colorName);
		}

		// if (selectedFilament && onChange) {
		// 	onChange(selectedFilament);
		// }

		if (m__selectedFilament) {
			setFilament(m__selectedFilament);
		}

		if (m__selectedFilament != null && onChange) {
			onChange(m__selectedFilament);
		}
	}

	// if (selectedFilament && onChange) {
	// 	onChange(selectedFilament);
	// }

	if (selectedFilament) {
		setValue("colorHex", getSingleColor(selectedFilament.color));
	}

	return isAnyAvailable ? (
		<>
			<div className="full">
				<input hidden {...register("colorHex")}></input>
				<div className="lg:flex gap-6 w-full">
					<div className="w-full">
						<label>Material</label>
						<select
							{...register("material")}
							required
							onChange={(m) =>
								changeFilament(m.target.value, undefined)
							}>
							<option>No Selection</option>
							{materials.map((material) => (
								<option key={material} id={material}>
									{material}
								</option>
							))}
						</select>
					</div>
					<div className="w-full">
						<label>Colors</label>
						<select
							{...register("colorName")}
							defaultValue={"No Selection"}
							required
							onChange={(s) =>
								changeFilament(undefined, s.target.value)
							}>
							<option>No Selection</option>
							{filamentsMatchingMaterial.map((filament) => (
								<option
									key={filament.id}
									id={filament.id.toString()}>
									{filament.color.name}
								</option>
							))}
						</select>
					</div>
				</div>
				{selectedFilament != undefined && showDescription && (
					// <Swatch swatch={selectedFilament.color}></Swatch>
					<div className="mb-4">
						<FilamentBlock filament={selectedFilament} />
					</div>
				)}
			</div>
		</>
	) : (
		<p>Filament is not available at this time.</p>
	);
}