import FilamentServe from "@/app/Types/Filament/FilamentServe";
import Farm from "./farm";

export default async function page() {
	const filaments = await FilamentServe.queryAll();

	return <Farm availableFilaments={filaments}></Farm>;
}
