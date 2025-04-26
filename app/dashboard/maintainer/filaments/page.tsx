import db from "@/app/api/Database";
import { FilamentList } from "./FilamentTable";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import FilamentManager from "./FilamentManager";
import HorizontalWrap from "@/app/components/HorizontalWrap";

export default async function Page() {
	const filaments = await FilamentServe.queryAll();

	return (
		<>
			{/* <div className="out p-4 xl:p-6 bg-white">
				<FilamentManager filaments={filaments}></FilamentManager>
			</div> */}
			<HorizontalWrap className="py-8">
				<FilamentList initialFilaments={filaments} />
			</HorizontalWrap>
		</>
	);
}
