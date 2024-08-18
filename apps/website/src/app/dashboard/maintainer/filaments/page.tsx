import db from "@/app/api/Database";
import { FilamentList } from "./FilamentTable";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";
import FilamentServe from "@/app/Types/Filament/FilamentServe";

export default async function Page() {
	const filaments = await FilamentServe.queryAll();

	return (
		<>
			<FilamentList initialFilaments={filaments} />
		</>
	);
}
