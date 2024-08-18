"use client";

import { ChangeEvent, useState, useEffect } from "react";
import Filament from "../Types/Filament/Filament";
import { SwatchConfiguration, Swatch } from "./Swatch";
import { RegularArrowRight } from "lineicons-react";
import { UseFormRegisterReturn } from "react-hook-form";

export function FilamentSelector({
	filaments,
	defaultMaterial,
	defaultColor,
	nameTransform,
	onChange,
	includeSwatchVisual
}: {
	filaments: Filament[];
	defaultMaterial?: string;
	defaultColor?: SwatchConfiguration;
	nameTransform?: (name: string) => string;
	onChange?: (material: string, colorName: string) => void;
	includeSwatchVisual?: boolean;
}) {
	includeSwatchVisual = includeSwatchVisual ?? true;

	if (filaments.length == 0) {
		return (
			<>
				<p id="filament-client-error" className="text-sm text-red-500">
					No filament is in stock! Use Comments.
				</p>
				<input type="hidden" name="material" value="" />
				<input type="hidden" name="color" value="" />
			</>
		);
	}

	let [error, setError] = useState("");

	//get list of all unique colors and materials
	let colorSet = new Set<SwatchConfiguration>();
	let materialSet = new Set<string>();

	for (let filament of filaments) {
		colorSet.add(filament.color);
		materialSet.add(filament.material);
	}

	//convert sets to arrays so that we can call Array.map
	let colors = Array.from(colorSet);
	let materials = Array.from(materialSet);

	let [selectedMaterial, setSelectedMaterial] = useState<string>(
		defaultMaterial ?? filaments[0].material
	);
	let [selectedColor, setSelectedColor] = useState<SwatchConfiguration>(
		defaultColor ?? filaments[0].color
	);

	//useEffect is called after each React render call when one of the variables from useState in the dependency
	//list (2nd parameter) are changed.
	useEffect(() => {
		if (!selectedColor || !selectedMaterial) {
			setError("");
		} else if (
			!filaments.find(
				(f) =>
					f.color.name.toLocaleUpperCase() ==
						selectedColor.name.toUpperCase() &&
					f.material.toUpperCase() == selectedMaterial.toUpperCase()
			)
		) {
			setError(`Filament is out of stock!`);
		} else {
			setError("");
		}

		//when any variables in this list are changed, the useEffect callback will be called
	}, [filaments, selectedColor, selectedMaterial]);

	let onChangeMaterial = function (e: ChangeEvent<HTMLSelectElement>) {
		//will call callback in useEffect function
		setSelectedMaterial(e.target.value);
		if (onChange != undefined) {
			onChange(selectedMaterial.toUpperCase(), selectedColor.name);
		}
	};

	let onChangeColor = function (e: ChangeEvent<HTMLSelectElement>) {
		//will call callback in useEffect function
		setSelectedColor(
			Array.from(colorSet.values()).find(
				(color, index) =>
					color.name.toLowerCase() == e.target.value.toLowerCase()
			)!
		);

		if (onChange != undefined) {
			onChange(selectedMaterial.toUpperCase(), e.target.value);
		}
	};

	console.log(selectedColor);

	console.log("Default Mat: ", defaultMaterial);
	console.log("Default Col: ", defaultColor);

	return (
		<div className="lg:flex gap-2 w-fit p-0 items-center">
			<select
				className="bg-transparent uppercase m-0 p-0 text-base"
				id="filament-material"
				name={nameTransform ? nameTransform("material") : "material"}
				onChange={onChangeMaterial}
				defaultValue={selectedMaterial}>
				{materials.map((m, index) => (
					<option key={m} value={m}>
						{m.toUpperCase()}
					</option>
				))}
			</select>
			<select
				className="bg-transparent w-fit m-0 p-0 text-base"
				id="filament-color"
				name={nameTransform ? nameTransform("color") : "color"}
				onChange={onChangeColor}
				defaultValue={selectedColor?.name}>
				{colors.map((c, index) => (
					<option key={c.name} value={c.name}>
						{c.name}
					</option>
				))}
				<option value="">Any</option>
			</select>
			<div className="w-fit">
				{includeSwatchVisual && selectedColor == undefined ? (
					<></>
				) : (
					<Swatch swatch={selectedColor}></Swatch>
				)}
			</div>
			<p id="filament-client-error" className="text-sm text-red-500">
				{error}
			</p>
		</div>
	);
}
