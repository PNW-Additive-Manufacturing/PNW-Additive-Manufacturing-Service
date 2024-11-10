import { validateColors } from "@/app/components/Swatch";
import Filament from "./Filament";
import db from "@/app/api/Database";
import postgres from "postgres";

export default class FilamentServe {
	public static fromSQLRow(filamentRow: postgres.Row): Filament {
		if (filamentRow == undefined)
			throw new TypeError("Filament data is undefined!");
		const filament: Filament = {
			id: filamentRow.id,
			inStock: filamentRow.instock,
			details: filamentRow.details,
			material: filamentRow.material,
			technology: filamentRow.technology,
			leadTimeInDays: filamentRow.leadtimeindays,
			costPerGramInCents: Number.parseFloat(
				filamentRow.costpergramincents
			),
			color: {
				name: filamentRow.colorname,
				monoColor: filamentRow.monocolor,
				diColor: {
					colorA: filamentRow.dicolora,
					colorB: filamentRow.dicolorb
				}
			}
		};
		validateColors(filament.color);
		return filament;
	}

	public static async queryById(
		filamentId: number
	): Promise<Filament | undefined> {
		const query = await db`SELECT * FROM Filament WHERE Id=${filamentId}`;
		const filamentRow = query.at(0);
		if (filamentRow == undefined) return;

		return FilamentServe.fromSQLRow(filamentRow);
	}

	public static async queryIdByNameAndMaterial(
		filamentColorName: string,
		filamentMaterial: string
	): Promise<Filament | undefined> {
		const query =
			await db`SELECT * FROM Filament WHERE ColorName=${filamentColorName} AND Material=${filamentMaterial}`;
		const filamentRow = query.at(0);
		if (filamentRow == undefined) return;

		return FilamentServe.fromSQLRow(filamentRow);
	}

	public static async queryAll(): Promise<Filament[]> {
		const query = await db`SELECT * FROM Filament ORDER BY Id ASC`;
		const allFilament: Filament[] = query.map(
			(filamentRow) => FilamentServe.fromSQLRow(filamentRow)!
		);

		return allFilament;
	}

	public static async delete(
		materialName: string,
		colorName: string
	): Promise<void> {
		await db`DELETE FROM Filament WHERE Material=${materialName} AND ColorName=${colorName}`;
	}

	public static async setInStock(
		materialName: string,
		colorName: string,
		inStock: boolean
	) {
		await db`UPDATE Filament SET InStock=${inStock} WHERE Material=${materialName} and ColorName=${colorName}`;
	}

	public static async insert(
		filament: Omit<Filament, "id">
	): Promise<number> {
		try {
			const insertRow =
				await db`INSERT INTO Filament (InStock, Material, ColorName, MonoColor, DiColorA, DiColorB, CostPerGramInCents, Details, LeadTimeInDays, Technology) VALUES (${
					filament.inStock
				}, ${filament.material}, ${filament.color.name}, ${
					filament.color.monoColor ?? null
				}, ${filament.color.diColor?.colorA ?? null}, ${
					filament.color.diColor?.colorB ?? null
				}, ${filament.costPerGramInCents}, ${
					filament.details
				}, ${filament.leadTimeInDays},
				${filament.technology}) RETURNING Id`;

			return insertRow.at(0)!.id;
		} catch (error) {
			console.error(error);
			throw new Error("An issue occurred inserting Filament!");
		}
	}
}
