"use client";

import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useState,
	useTransition
} from "react";
import {
	deleteFilament,
	setFilamentInStock
} from "@/app/api/server-actions/maintainer";
import Table from "@/app/components/Table";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";
import {
	SwatchConfiguration,
	Swatch,
	NamedSwatch
} from "@/app/components/Swatch";
import Filament from "@/app/Types/Filament/Filament";

export function FilamentList({
	initialFilaments
}: {
	initialFilaments: Filament[];
}) {
	var [filaments, setFilamentList] = useState(initialFilaments);
	var [pending, startTransition] = useTransition();
	var [error, setError] = useState("");

	let clickHandler = (
		filamentMaterial: string,
		filamentColor: SwatchConfiguration
	) => {
		startTransition(async () => {
			let form = new FormData();
			form.append("filament-material", filamentMaterial);
			form.append("filament-color", filamentColor.name);

			await deleteFilament(error, form);

			setFilamentList(
				filaments.filter(
					(f) =>
						f.material !== filamentMaterial ||
						f.color.name !== filamentColor.name
				)
			);
		});
	};

	let changeHandler = (
		e: ChangeEvent<HTMLSelectElement>,
		filament: Filament
	) => {
		if ((e.target.value === "true") === filament.inStock) {
			return;
		}

		let newInStock = e.target.value;

		startTransition(async () => {
			let form = new FormData();
			form.append("filament-material", filament.material);
			form.append("filament-color", filament.color.name);
			form.append("filament-instock", newInStock);

			let errorMessage = await setFilamentInStock("", form);
			if (errorMessage) {
				setError(errorMessage);
				return;
			}

			setFilamentList(
				filaments.map((f) => {
					if (
						f.material === filament.material &&
						f.color.name === filament.color.name
					) {
						f.inStock = newInStock === "true";
					}
					return f;
				})
			);
		});
	};

	return (
		<>
			<DropdownSection name="Filaments" collapsible={true}>
				<p className="text-red-600">{error}</p>
				<Table>
					<thead>
						<tr>
							<th className="text-left pl-5">Material</th>
							<th className="text-left">Color</th>
							<th className="text-left">Cost per Gram</th>
							<th className="text-left">In Stock</th>
							<th className="text-left">Details</th>
							<th className="text-left pr-5">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filaments.map((f: Filament) => (
							<tr key={f.material + f.color.name}>
								<td className="text-left pl-5">
									{f.material.toUpperCase()}
								</td>
								<td className="text-left">
									<NamedSwatch swatch={f.color}></NamedSwatch>
								</td>
								<td>
									${(f.costPerGramInCents / 100).toFixed(2)}
								</td>
								<td className="text-left">
									<select
										className="bg-transparent"
										onChange={(e) => changeHandler(e, f)}
										defaultValue={
											f.inStock ? "true" : "false"
										}>
										<option value="true">true</option>
										<option value="false">false</option>
									</select>
								</td>
								<td className="">{f.details}</td>
								<td className="text-left pr-5">
									<button
										className="bg-red-600 px-2 py-1 w-fit rounded-lg border-none"
										onClick={(e) =>
											clickHandler(f.material, f.color)
										}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</DropdownSection>

			<DropdownSection name="Add Filament" className="mt-8" hidden={true}>
				<FilamentForm />
			</DropdownSection>
		</>
	);
}
