import { formatToCSSGradient, getSingleColor } from "../components/Swatch";
import Filament from "../Types/Filament/Filament";

export default function FilamentBlock({ filament }: { filament: Filament }) {
	return (
		// <div className="shadow-sm rounded-sm p-3 bg-white outline outline-2 outline-gray-200">
		<div className="px-1">
			<div className="flex gap-3 items-center">
				<div
					className="h-10 w-5 shadow-sm rounded-sm outline outline-2 lg:outline-4 outline-gray-200"
					style={{
						opacity: 0.8,
						backgroundColor: filament.color.monoColor,
						backgroundImage:
							filament.color.diColor != undefined
								? formatToCSSGradient(filament.color, 45 * 3)
								: undefined
					}}></div>
				<div>
					<p className="text-lg">
						{filament.material} {filament.color.name}
					</p>
					{/* <p className="text-sm">{filament.color.name} | High-strength durability</p> */}
					<p className="text-sm">High-strength & Durable.</p>
					{/* <p className="text-sm">{filament.color.name}</p> */}
				</div>
			</div>
		</div>
	);
}
