"use client";

import { useForm } from "react-hook-form";
import { Input } from "./Input";
import Filament from "../Types/Filament/Filament";
import { Swatch } from "./Swatch";
import { useDebounce } from "react-use";
import { Label } from "./Inputs";
import FilamentBlock from "../experiments/FilamentBlock";

export default function PopupFilamentSelector({
	filaments,
	onChange,
	defaultFilament
}: {
	filaments: Filament[];
	defaultFilament?: { material?: string; colorName?: string };
	onChange?: (chosenFilament: Filament) => void;
}) {
	const materials: string[] = [];
	for (let filament of filaments) {
		const isExisting =
			materials.find((material) => material == filament.material) !=
			undefined;

		if (!isExisting) materials.push(filament.material);
	}

	const isAnyAvailable = materials.length > 0;

	const { register, watch, trigger } = useForm<{
		material: string;
		colorName: string;
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

	if (selectedFilament && onChange) {
		onChange(selectedFilament);
	}

	return isAnyAvailable ? (
		<>
			<div className="full">
				<div className="lg:flex gap-6 w-full">
					<div className="w-full">
						<label>Material</label>
						<select {...register("material")}>
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
							defaultValue={"No Selection"}>
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
				{selectedFilament != undefined && (
					// <Swatch swatch={selectedFilament.color}></Swatch>
					<FilamentBlock filament={selectedFilament} />
				)}
			</div>
		</>
	) : (
		<p>Filament is not available at this time.</p>
	);
}
