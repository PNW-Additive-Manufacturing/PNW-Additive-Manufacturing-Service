import { formatToCSSGradient, getSingleColor } from "../components/Swatch";
import Filament from "../Types/Filament/Filament";

export default function FilamentBlock({ filament }: { filament: Filament }) {
	return (
		<div className="px-1">
			<div className="flex gap-5">
				<div
					className="h-auto w-6 mt-1 shadow-sm rounded-sm outline outline-2 lg:outline-4 outline-gray-200"
					style={{
						opacity: 0.8,
						backgroundColor: filament.color.monoColor,
						backgroundImage:
							filament.color.diColor != undefined
								? formatToCSSGradient(filament.color, 45 * 3)
								: undefined
					}}></div>
				<div>
					<a target="_blank" href={`/materials#${filament.technology}-${filament.material.replaceAll(" ", "-")}`} className="text-lg">
						{filament.material} {filament.color.name}
					</a>
					<p className="text-sm" style={{ maxWidth: "450px" }}>{filament.details}</p>
				</div>
			</div>
		</div>
	);
}
