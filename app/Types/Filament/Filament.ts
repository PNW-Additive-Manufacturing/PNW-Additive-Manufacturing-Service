import { SwatchConfiguration } from "@/app/components/Swatch";

export default interface Filament {
	id: number;
	material: string;
	color: SwatchConfiguration;
	technology: string;
	costPerGramInCents: number;
	inStock: boolean;
	details: string;
	leadTimeInDays: number;
}
