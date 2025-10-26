import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Filament from "../Types/Filament/Filament";
import { NamedSwatch } from "./Swatch";

type FilamentSelectorProps = {
	filaments: Filament[],
	defaultFilament?: Filament;
	canSelectOutOfStock: boolean,
	materialInputID?: string;
	colorNameInputID?: string;
	displayFilamentInsight: boolean;
	onChange?: (chosenFilament: Filament) => void
};

export default function FilamentSelector({ filaments, materialInputID, colorNameInputID, onChange, canSelectOutOfStock, displayFilamentInsight, defaultFilament }: FilamentSelectorProps) {

	materialInputID ||= "filament-selector-material";
	colorNameInputID ||= "filament-selector-color";

	if (filaments.length == 0) return <>Contact an Admin, there are no available Filaments!</>;

	const availableMaterials = useMemo(() => {
		// We need a unique list of the materials!
		const uniqueMaterials = new Set<string>();
		for (let material of filaments.map(f => f.material)) {
			uniqueMaterials.add(material);
		}
		return Array.from(uniqueMaterials);

	}, [filaments]);

	const defaultMaterial = useMemo(() => {
		const PLAIndex = availableMaterials.findIndex(m => m.toUpperCase() == "PLA");
		const hasPLA = PLAIndex > 0;

		// If PLA exists, use it as a default or use the first material available
		return hasPLA ? availableMaterials[PLAIndex] : availableMaterials.at(0)!;
	}, [availableMaterials]);

	const [selectedMaterial, setSelectedMaterial] = useState<string>(defaultMaterial);
	const availableColors = useMemo(() => filaments.filter(f => f.material == selectedMaterial && (canSelectOutOfStock ? true : f.inStock)).map(f => f.color), [selectedMaterial])

	const [selectedFilament, setSelectedFilament] = useState<Filament | undefined>(defaultFilament);

	useEffect(() => {
		// Material was switched, use the first available color matching the given material.
		setSelectedFilament(availableColors.map(c => filaments.find(f => f.color.name == c.name)!).find(f => f.material == selectedMaterial && (canSelectOutOfStock ? true : f.inStock)));

	}, [selectedMaterial, availableColors, filaments]);


	const chooseColor = useCallback((colorName: string) => {
		console.log(selectedMaterial, colorName);
		const newSelectedFilament = filaments.find(f => f.material == selectedMaterial && f.color.name == colorName);

		if (newSelectedFilament == undefined) {
			toast.error("Contact an Admin, selected filament does not exist!");
			return;
		}
		setSelectedFilament(newSelectedFilament);
		if (onChange) onChange(newSelectedFilament);

	}, [selectedMaterial, filaments]);

	return <>

		<select
			title="Filament Material"
			className="mb-0"
			name={materialInputID} id={materialInputID}
			defaultValue={selectedFilament?.material}
			onChange={(ev) => setSelectedMaterial(ev.currentTarget.value)}>

			<option disabled={true}>Choose a variant of {selectedMaterial}</option>

			{availableMaterials.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
		</select>

		<select
			title="Filament Color"
			className="mb-0"
			name={colorNameInputID} id={colorNameInputID}
			defaultValue={selectedFilament?.color.name}
			onChange={(ev) => chooseColor(ev.currentTarget.value)}>

			{availableColors.length > 0
				? <option disabled={true}>Choose a variant of {selectedMaterial}</option>
				: <option disabled={true}>{selectedMaterial} does not have any available colors!</option>}

			{availableColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
		</select>

		{displayFilamentInsight && selectedFilament != null && <p className="text-xs"><FilamentInsight selectedFilament={selectedFilament} /></p>}
	</>

}

export function FilamentInsight({ selectedFilament }: { selectedFilament: Filament }) {
	return <a target="_blank" className="w-fit mt-0 button" href={`/materials#${selectedFilament.technology.toLowerCase()}-${selectedFilament.material.replaceAll(" ", "-").toLowerCase()}`}>
		{/* <RegularEye className="inline mb-0.5 mr-2" /> */}
		View properties of {`${selectedFilament.material.toUpperCase()} `}
		<NamedSwatch swatch={selectedFilament.color} style="long" />
	</a>
}
