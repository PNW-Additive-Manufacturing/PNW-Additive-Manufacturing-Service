import FilamentServe from "@/app/Types/Filament/FilamentServe";
import ManufacturingMethodServe from "@/app/Types/ManufacturingMethod/ManufacturingMethodServe";
import MaterialServe from "@/app/Types/Material/MaterialServe";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import FilamentManager from "./FilamentManager";

export default async function Page() {
	const [methods, materials, filaments] = await Promise.all([
		ManufacturingMethodServe.queryAll(),
		MaterialServe.queryAll(),
		FilamentServe.queryAll({ includeArchived: true }),
	]);

	return (
		<HorizontalWrap className="py-8">
			<h1 className="text-2xl font-normal mb-6">Filament Inventory</h1>
			<FilamentManager methods={methods} materials={materials} filaments={filaments} />
		</HorizontalWrap>
	);
}
