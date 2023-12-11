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

	return <div className='w-full xl:w-3/4 lg:mx-auto'>
		<DropdownSection name="Filaments" collapsible={true}>
			<FilamentList initialFilaments={filaments} />
		</DropdownSection>
		<DropdownSection name="Add Filament" hidden={true}>
			<FilamentForm/>
		</DropdownSection>
	
	</div>
}