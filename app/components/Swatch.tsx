import classNames from "classnames";
import { CSSProperties } from "react";
import z from "zod";

export const SwatchConfigurationSchema = z.object({ name: z.string() })
	.and(z.object({ monoColor: z.string() })
	.or(z.object({
		diColor: z.object({
			colorA: z.string(),
			colorB: z.string() })})));

export type SwatchConfiguration = z.infer<typeof SwatchConfigurationSchema>;

export function templatePNW(): SwatchConfiguration {
	return {
		name: "PNW Gold",
		monoColor: "#b1810b"
	};
}

export function templateWhite(): SwatchConfiguration {
	return {
		name: "White",
		monoColor: "#FFFFFF"
	};
}

export function templateWarning(): SwatchConfiguration {
	return {
		name: "Warning Red",
		monoColor: "#EF4444"
	};
}

export function formatToCSSGradient(
	swatch: SwatchConfiguration,
	degree?: number
): string {
	degree = degree ?? 90;

	if ("monoColor" in swatch) {
		throw new TypeError("Swatch must be a diColor!");
	}
	return `linear-gradient(${degree}deg, ${swatch.diColor.colorA} 0%, ${swatch.diColor.colorB} 100%)`;
}

export function getSingleColor(swatch: SwatchConfiguration): string {
	return "diColor" in swatch ? swatch.diColor.colorA : swatch.monoColor;
}

export function isGradient(swatch: SwatchConfiguration): boolean {
	return "diColor" in swatch;
}

export function NamedSwatch({ swatch, style }: { swatch: SwatchConfiguration, style: "compact" | "long" }) {
	return (
		<span className="bg-transparent">
			<span className="text-inherit mr-2">{swatch.name}</span>
			<Swatch swatch={swatch} style={style} />
		</span>
	);
}

export function Swatch({ swatch, style }: { swatch: SwatchConfiguration, style: "compact" | "long" }) {
    return (
        <span
            className={classNames("inline-block shadow-sm rounded-md outline outline-1 outline-gray-200", {
                "w-[0.8em] h-[0.8em]": style == "compact",
                "w-10 h-3": style == "long"
            })}
            style={styleCSSSwatch(swatch)}></span>
    );
}

export function styleCSSSwatch(swatch: SwatchConfiguration): CSSProperties {
	return {
		backgroundColor: "monoColor" in swatch ? swatch.monoColor : undefined,
		backgroundImage: "diColor" in swatch ? formatToCSSGradient(swatch) : undefined
	};
}

export function SwatchColorBlock({ swatch }: { swatch: SwatchConfiguration }) {
	return <div>
		<div className="w-auto h-8 out" style={styleCSSSwatch(swatch)} />
		<span className="text-sm px-1 text-nowrap">{swatch.name}</span>
	</div>
}