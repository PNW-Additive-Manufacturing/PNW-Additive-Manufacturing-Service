import { SwatchConfigurationSchema } from "@/app/components/Swatch";
import { uniqueBy } from "@/app/utils/ArrayUtils";
import z from "zod";
import { ItemSchema } from "../Item";
import { ManufacturingMethodSchema } from "../ManufacturingMethod/ManufacturingMethod";
import { MaterialSchema } from "../Material/Material";

export const FilamentSchema = ItemSchema.pick({ learnMoreURL: true, description: true, icon: true, benefits: true, cons: true }).extend({

	id: z.number(),
	material: MaterialSchema,
	color: SwatchConfigurationSchema,
	manufacturingMethod: ManufacturingMethodSchema,
	costPerGramInCents: z.number().gte(0),
	inStock: z.boolean(),
	isArchived: z.boolean(),
	leadTimeInDays: z.number().gte(0)

});

type Filament = z.infer<typeof FilamentSchema>;

export default Filament;

// const stringToHashEncoder = new TextEncoder(); // Encodes as UTF-8 https://en.wikipedia.org/wiki/UTF-8
// async function computeFilamentHash(filament: Filament)
// {
// 	const stringToHash = `${filament.manufacturingMethod.wholeName} ${filament.material.wholeName} ${filament.color.name}`;

// 	const arrayBufferToHash = stringToHashEncoder.encode(stringToHash).buffer;

// 	const hashArray = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1", arrayBufferToHash)));

// 	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

// 	return hashHex;
// }

export const getUniqueMaterials = (filaments: Filament[]) => uniqueBy(filaments.map(f => f.material), m => m.wholeName);

export const getUniqueManufacturingMethods = (filaments: Filament[]) => uniqueBy(filaments.map(f => f.manufacturingMethod), m => m.wholeName);

