import db from "@/app/api/Database";
import { Filament, FilamentList } from "./FilamentTable";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";

export default async function Page() {
	let filaments: Filament[] = (await db`select * from filament`).map((f) => {
		return {
			material: f.material,
			color: f.color,
			instock: f.instock
		};
	});

	return <>
		<FilamentList initialFilaments={filaments} />
		
	</>
}