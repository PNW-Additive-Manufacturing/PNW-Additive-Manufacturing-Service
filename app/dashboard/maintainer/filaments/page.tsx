import db from "@/app/api/Database";
import { FilamentList } from "./FilamentTable";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import FilamentManager from "./FilamentManager";

export default async function Page() {
	const filaments = await FilamentServe.queryAll();

	return (
		<>
			{/* <div className="out p-4 xl:p-6 bg-white">
				<FilamentManager filaments={filaments}></FilamentManager>
			</div> */}
			<FilamentList initialFilaments={filaments} />
		</>
	);
}
