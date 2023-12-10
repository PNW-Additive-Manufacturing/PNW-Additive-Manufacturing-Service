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
		<Dropdown name="Filament" collapsible={false}>
			<FilamentList initialFilaments={filaments} />

			<Dropdown name="Add Filament" hidden={true}>
				<FilamentForm/>
			</Dropdown>
		</Dropdown>
	</div>
}