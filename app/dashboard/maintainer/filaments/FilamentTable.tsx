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
			<label>Filaments</label>
			<div className="p-4 lg:p-6 rounded-sm shadow-sm bg-white out">
				<p className="text-red-600">{error}</p>
				<Table className="spaced">
					<thead>
						<tr>
							<th className="text-left pl-5">Material</th>
							<th className="text-left">Color</th>
							<th className="text-left">Cost per Gram</th>
							<th className="text-left">In Stock</th>
							<th className="text-left">Lead Time</th>
							<th className="text-left">Technology</th>
							<th className="text-left">Details</th>
							<th className="text-left pr-5">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filaments.map((f: Filament) => (
							<tr className="w-full border-l-4 out bg-white" key={f.material + f.color.name}>
								<td>{f.material.toUpperCase()}</td>
								<td><NamedSwatch swatch={f.color}></NamedSwatch></td>
								<td>${(f.costPerGramInCents / 100).toFixed(2)}</td>
								<td>
									<select
										className="bg-transparent mb-0"
										onChange={(e) => changeHandler(e, f)}
										defaultValue={
											f.inStock ? "true" : "false"
										}>
										<option value="true">true</option>
										<option value="false">false</option>
									</select>
								</td>
								<td>{f.leadTimeInDays}</td>
								<td>{f.technology}</td>
								<td className="text-sm">{f.details}</td>
								<td>
									{/* <button
										className="bg-red-600 px-2 py-1 w-fit rounded-lg border-none mb-0"
										onClick={(e) =>
											clickHandler(f.material, f.color)
										}>
										Delete
									</button> */}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>

			<DropdownSection name="Add Filament" className="mt-8" hidden={true}>
				<FilamentForm />
			</DropdownSection>
		</>
	);
}
