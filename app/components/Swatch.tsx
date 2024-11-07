import { useState } from "react";
import Filament from "../Types/Filament/Filament";

export type SwatchConfiguration = {
	name: string;
	monoColor?: string;
	diColor?: {
		colorA: string;
		colorB: string;
	};
};

export function templatePNW(): SwatchConfiguration {
	return {
		name: "PNW Gold",
		monoColor: "#b1810b"
	};
}

export function validateColors(swatch: SwatchConfiguration): void {
	if (swatch?.name == undefined) {
		throw new TypeError("Swatch name cannot be undefined!");
	}
	if (swatch?.monoColor == undefined && swatch?.diColor == undefined) {
		throw new TypeError("Swatch must contain either a mono or di color!");
	}
}

export function formatToCSSGradient(
	swatch: SwatchConfiguration,
	degree?: number
): string {
	degree = degree ?? 90;

	if (swatch?.diColor == undefined) {
		throw new TypeError("Swatch must be a diColor!");
	}
	return `linear-gradient(${degree}deg, ${swatch.diColor!.colorA} 0%, ${swatch.diColor.colorB} 100%)`;
}

export function getSingleColor(swatch: SwatchConfiguration): string {
	return swatch.monoColor ?? swatch.diColor!.colorA;
}

export function isGradient(swatch: SwatchConfiguration): boolean {
	return (
		swatch.diColor?.colorA != undefined &&
		swatch.diColor?.colorB != undefined
	);
}

export function NamedSwatch({ swatch }: { swatch: SwatchConfiguration }) {
	validateColors(swatch);

	return (
		<span className="bg-transparent ">
			<span className="text-inherit mr-2">{swatch.name}</span>
			<Swatch swatch={swatch}></Swatch>
		</span>
	);
}

export function Swatch({ swatch }: { swatch: SwatchConfiguration }) {
	validateColors(swatch);

	return (
		<span
			className="inline-block h-2.5 w-14 shadow-sm rounded-lg px-9 outline outline-2 lg:outline-4 outline-gray-200"
			style={{
				backgroundColor: swatch.monoColor,
				backgroundImage:
					swatch.diColor != undefined
						? formatToCSSGradient(swatch)
						: undefined
			}}></span>
	);
}

export function SwatchColorBlock({ swatch }: { swatch: SwatchConfiguration }) {
	return <div>
		<div className="w-auto h-8 out" style={{
			backgroundColor: swatch.monoColor,
			backgroundImage:
				swatch.diColor != undefined
					? formatToCSSGradient(swatch)
					: undefined
		}} />
		<span className="text-sm px-1 text-nowrap">{swatch.name}</span>
	</div>
}

// export function SwatchSelector({
// 	availableFilaments
// }: {
// 	availableFilaments: Filament[];
// }) {
// 	const [selectedColor, setSelectedColor] = useState<Filament | undefined>(
// 		availableFilaments.at(0)
// 	);

// 	return (
// 		<>
// 			<input
// 				name="filament-colorName"
// 				id="filament-colorName"
// 				value={selectedColor?.color.name}
// 				hidden
// 				className="hidden"></input>
// 			<div className="py-2 px-2 bg-white">
// 				{availableFilaments.map((filament) => (
// 					<div
// 						className="w-40"
// 						onClick={() => setSelectedColor(filament)}>
// 						<Swatch swatch={filament.color}></Swatch>
// 					</div>
// 				))}
// 			</div>
// 		</>
// 	);
// }
