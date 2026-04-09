import { styleCSSSwatch } from "../components/Swatch";
import Filament from "../Types/Filament/Filament";

export default function FilamentBlock({ filament }: { filament: Filament }) {
	return (
		<div className="px-1">
			<div className="flex gap-5">
				<div
					className="h-auto w-6 mt-1 shadow-sm rounded-sm outline outline-2 lg:outline-4 outline-gray-200"
					style={{ opacity: 0.8, ...styleCSSSwatch(filament.color) }}></div>
				<div>
					<a target="_blank" href={`/materials#${filament.manufacturingMethod.shortName}-${filament.material.shortName.replaceAll(" ", "-")}`} className="text-lg">
						{filament.material.shortName} {filament.color.name}
					</a>
					<p className="text-sm" style={{ maxWidth: "450px" }}>{filament.description}</p>
				</div>
			</div>
		</div>
	);
}
