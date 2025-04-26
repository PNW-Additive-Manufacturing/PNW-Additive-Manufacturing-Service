import FilamentServe from "@/app/Types/Filament/FilamentServe";
import Farm from "./farm";
import HorizontalWrap from "@/app/components/HorizontalWrap";

export default async function page() {
	const filaments = await FilamentServe.queryAll();

	return <>

		<HorizontalWrap className="py-8">
			<Farm availableFilaments={filaments} />
		</HorizontalWrap>

	</>;
}
