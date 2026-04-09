import db from "@/app/api/Database";
import postgres from "postgres";
import Filament, { FilamentSchema } from "./Filament";

const filamentSelectColumns = `
	f.id, f.instock, f.isarchived, f.details, f.colorname, f.monocolor, f.dicolora, f.dicolorb,
	f.costpergramincents, f.leadtimeindays,
	m.shortname  AS mat_shortname,  m.wholename  AS mat_wholename,  m.description AS mat_description,
	m.icon       AS mat_icon,       m.benefits   AS mat_benefits,   m.cons        AS mat_cons,
	m.learnmoreurl AS mat_learnmoreurl,
	mm.shortname AS method_shortname, mm.wholename AS method_wholename, mm.description AS method_description,
	mm.icon      AS method_icon,    mm.benefits  AS method_benefits, mm.cons       AS method_cons,
	mm.learnmoreurl AS method_learnmoreurl, mm.company AS method_company, mm.unit AS method_unit
`;

export default class FilamentServe {
	public static fromSQLRow(row: postgres.Row): Filament {
		if (row == undefined)
			throw new TypeError("Filament data is undefined!");

		return FilamentSchema.parse({
			id: row.id,
			inStock: row.instock,
			isArchived: row.isarchived ?? false,
			description: row.details,
			benefits: [],
			cons: [],
			icon: undefined,
			learnMoreURL: undefined,
			material: {
				shortName: row.mat_shortname,
				wholeName: row.mat_wholename,
				description: row.mat_description ?? "",
				icon: row.mat_icon ?? undefined,
				benefits: row.mat_benefits ?? [],
				cons: row.mat_cons ?? [],
				learnMoreURL: row.mat_learnmoreurl ?? undefined,
			},
			manufacturingMethod: {
				shortName: row.method_shortname,
				wholeName: row.method_wholename,
				description: row.method_description ?? "",
				icon: row.method_icon ?? undefined,
				benefits: row.method_benefits ?? [],
				cons: row.method_cons ?? [],
				learnMoreURL: row.method_learnmoreurl ?? undefined,
				company: row.method_company ?? undefined,
				unit: row.method_unit ?? "g",
			},
			costPerGramInCents: Number.parseFloat(row.costpergramincents),
			leadTimeInDays: row.leadtimeindays,
			color: {
				name: row.colorname,
				monoColor: row.monocolor ?? undefined,
				diColor: row.dicolora
					? { colorA: row.dicolora, colorB: row.dicolorb }
					: undefined,
			},
		});
	}

	public static async queryById(
		filamentId: number
	): Promise<Filament | undefined> {
		const query = await db`
			SELECT ${db.unsafe(filamentSelectColumns)}
			FROM Filament f
			JOIN Material m  ON f.Material = m.ShortName
			JOIN ManufacturingMethod mm ON f.ManufacturingMethodShortName = mm.ShortName
			WHERE f.Id = ${filamentId}
		`;
		const row = query.at(0);
		if (row == undefined) return;
		return FilamentServe.fromSQLRow(row);
	}

	public static async queryByIds(
		filamentIds: number[]
	): Promise<Filament[]> {
		if (filamentIds.length === 0) return [];
		const query = await db`
			SELECT ${db.unsafe(filamentSelectColumns)}
			FROM Filament f
			JOIN Material m  ON f.Material = m.ShortName
			JOIN ManufacturingMethod mm ON f.ManufacturingMethodShortName = mm.ShortName
			WHERE f.Id IN ${db(filamentIds)}
		`;
		return query.map((row) => FilamentServe.fromSQLRow(row));
	}

	public static async queryByColorAndMaterial(
		colorName: string,
		materialShortName: string,
		inStock?: boolean
	): Promise<Filament | undefined> {
		inStock = inStock == undefined ? true : inStock;

		const query = await db`
			SELECT ${db.unsafe(filamentSelectColumns)}
			FROM Filament f
			JOIN Material m  ON f.Material = m.ShortName
			JOIN ManufacturingMethod mm ON f.ManufacturingMethodShortName = mm.ShortName
			WHERE f.ColorName = ${colorName} AND f.Material = ${materialShortName} AND f.InStock = ${inStock}
		`;
		const row = query.at(0);
		if (row == undefined) return;
		return FilamentServe.fromSQLRow(row);
	}

	public static async queryAll(options?: { includeArchived?: boolean }): Promise<Filament[]> {
		const includeArchived = options?.includeArchived ?? false;
		const query = await db`
			SELECT ${db.unsafe(filamentSelectColumns)}
			FROM Filament f
			JOIN Material m  ON f.Material = m.ShortName
			JOIN ManufacturingMethod mm ON f.ManufacturingMethodShortName = mm.ShortName
			WHERE (${includeArchived} OR f.IsArchived = FALSE)
			ORDER BY f.Id ASC
		`;
		return query.map((row) => FilamentServe.fromSQLRow(row));
	}

	public static async countReferencingParts(filamentId: number): Promise<number> {
		const result = await db`
			SELECT COUNT(*)::int AS count FROM Part
			WHERE AssignedFilamentId = ${filamentId} OR SupplementedFilamentId = ${filamentId}
		`;
		return result.at(0)?.count ?? 0;
	}

	public static async delete(filamentId: number): Promise<void> {
		const referencingParts = await FilamentServe.countReferencingParts(filamentId);
		if (referencingParts > 0) {
			throw new Error(
				`This filament is referenced by ${referencingParts} existing part(s) and cannot be deleted. Archive it instead to hide it from new orders while preserving history.`
			);
		}
		await db`DELETE FROM Filament WHERE Id = ${filamentId}`;
	}

	public static async setArchived(
		filamentId: number,
		isArchived: boolean
	): Promise<void> {
		if (isArchived) {
			await db`UPDATE Filament SET IsArchived = TRUE, InStock = FALSE WHERE Id = ${filamentId}`;
		} else {
			await db`UPDATE Filament SET IsArchived = FALSE WHERE Id = ${filamentId}`;
		}
	}

	public static async setInStock(
		filamentId: number,
		inStock: boolean
	): Promise<void> {
		await db`UPDATE Filament SET InStock = ${inStock} WHERE Id = ${filamentId}`;
	}

	public static async update(
		filament: Pick<Filament, "id" | "color" | "costPerGramInCents" | "leadTimeInDays" | "description">
	): Promise<void> {
		const monoColor = "monoColor" in filament.color ? filament.color.monoColor : null;
		const diColorA = "diColor" in filament.color ? filament.color.diColor.colorA : null;
		const diColorB = "diColor" in filament.color ? filament.color.diColor.colorB : null;
		await db`
			UPDATE Filament SET
				ColorName = ${filament.color.name},
				MonoColor = ${monoColor},
				DiColorA = ${diColorA},
				DiColorB = ${diColorB},
				CostPerGramInCents = ${filament.costPerGramInCents},
				Details = ${filament.description},
				LeadTimeInDays = ${filament.leadTimeInDays}
			WHERE Id = ${filament.id}
		`;
	}

	public static async insert(
		filament: Omit<Filament, "id">
	): Promise<number> {
		try {
			const monoColor = "monoColor" in filament.color ? filament.color.monoColor : null;
			const diColorA = "diColor" in filament.color ? filament.color.diColor.colorA : null;
			const diColorB = "diColor" in filament.color ? filament.color.diColor.colorB : null;
			const insertRow = await db`
				INSERT INTO Filament (
					InStock, Material, ManufacturingMethodShortName, ColorName,
					MonoColor, DiColorA, DiColorB,
					CostPerGramInCents, Details, LeadTimeInDays
				) VALUES (
					${filament.inStock},
					${filament.material.shortName},
					${filament.manufacturingMethod.shortName},
					${filament.color.name},
					${monoColor},
					${diColorA},
					${diColorB},
					${filament.costPerGramInCents},
					${filament.description},
					${filament.leadTimeInDays}
				) RETURNING Id
			`;
			return insertRow.at(0)!.id;
		} catch (error) {
			console.error(error);
			throw new Error("An issue occurred inserting Filament!");
		}
	}
}
