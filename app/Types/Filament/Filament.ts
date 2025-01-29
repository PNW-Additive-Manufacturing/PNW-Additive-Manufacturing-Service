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

export function getMaterials(filaments: Filament[]): string[] {
    const uniqueMaterials = new Set<string>();
    
    for (const filament of filaments) {
        uniqueMaterials.add(filament.material);
    }
    return Array.from(uniqueMaterials);
}