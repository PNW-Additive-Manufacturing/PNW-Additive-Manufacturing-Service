import db from "@/app/api/Database";
import { Filament, FilamentList } from "./FilamentTable";
import Dropdown from "@/app/components/Dropdown";
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
		<Dropdown name="Filaments" collapsible={true}>
			<FilamentList initialFilaments={filaments} />
		</Dropdown>
		<Dropdown name="Add Filament" hidden={true} className='mt-8'>
			<FilamentForm/>
		</Dropdown>
	
	</div>
}