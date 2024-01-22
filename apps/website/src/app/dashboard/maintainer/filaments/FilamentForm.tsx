"use client"

import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { addFilament } from "@/app/api/server-actions/maintainer";
import { useState } from "react";

export function FilamentForm({onAddCallback} : {onAddCallback: (newMaterial: string, newColor: string, instock: boolean) => void}) {
	let [material, setMaterial] = useState("");
	let [color, setColor] = useState("");

	let action = async (prevState: string, formData: FormData) => {
		let result = await addFilament(prevState, formData);
		if(result.error) {
			return result.error;
		}

		onAddCallback(result.newMaterial!, result.newColor!, result.instock!);
		setMaterial("");
		setColor("");
		return "";
	};

	return <GenericFormServerAction serverAction={action} submitName="Add Filament" submitPendingName="Adding Filament...">
		<Input type="text" name="filament-material" id="filament-material" label="Filament Material" placeholder="PLA, PETG, & More" value={material} onChange={(e) => {setMaterial(e.target.value)}}/>
		<Input type="text" name="filament-color" id="filament-color" label="Filament Color" placeholder="White, Black, Red & More" value={color} onChange={(e) => {setColor(e.target.value)}}/>

	</GenericFormServerAction>;
}
