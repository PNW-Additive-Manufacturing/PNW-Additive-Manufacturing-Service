import {
	ChangeEvent,
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useState,
} from "react";

function FilamentMaterialItem({
	material,
	onDelete,
}: {
	material: string;
	onDelete: (material: string) => void;
}) {
	return (
		<span
			className="rounded p-1 mr-2 hover:cursor-pointer bg-slate-200"
			onClick={(e) => onDelete(material)}>
			{material.toUpperCase()}
			<span className="pl-2 font-extrabold">X</span>
		</span>
	);
}

export function SupportedFilaments({
	filamentOptions,
	currentMaterials,
	setMaterialCallback,
	selectedFilament,
	setSelectedFilament,
}: {
	filamentOptions: string[];
	currentMaterials: string[];
	setMaterialCallback: Dispatch<SetStateAction<string[]>>;
	selectedFilament: string;
	setSelectedFilament: Dispatch<SetStateAction<string>>;
}) {
	let onChange = (e: ChangeEvent<HTMLSelectElement>) => {
		let val = e.target.value;
		setSelectedFilament(e.target.value);
		if (val && !currentMaterials.find((f) => f === val)) {
			let newArr = currentMaterials.slice(0);
			newArr.push(val);
			setMaterialCallback(newArr);
		}
	};
	return (
		<>
			<select
				className="p-2 rounded"
				onChange={onChange}
				value={selectedFilament}>
				<option value="" defaultChecked={true}>
					--Select a Filament--
				</option>
				{filamentOptions.map((f) => (
					<option key={f} value={f}>
						{f.toUpperCase()}
					</option>
				))}
			</select>
			{currentMaterials.map((f) => (
				<input
					key={f}
					type="hidden"
					name="supported_materials"
					value={f}
				/>
			))}
			<div className="mt-2 p-2">
				{currentMaterials.map((f) => (
					<FilamentMaterialItem
						key={f}
						material={f}
						onDelete={(material) =>
							setMaterialCallback(
								currentMaterials.filter((f) => f !== material),
							)
						}
					/>
				))}
			</div>
		</>
	);
}
