import db from "@/app/api/Database";
import postgres from "postgres";
import { ManufacturingMethod, ManufacturingMethodSchema } from "./ManufacturingMethod";

export default class ManufacturingMethodServe {
	public static fromSQLRow(row: postgres.Row): ManufacturingMethod {
		return ManufacturingMethodSchema.parse({
			shortName: row.shortname,
			wholeName: row.wholename,
			description: row.description ?? "",
			icon: row.icon ?? undefined,
			benefits: row.benefits ?? [],
			cons: row.cons ?? [],
			learnMoreURL: row.learnmoreurl ?? undefined,
			company: row.company ?? undefined,
			unit: row.unit ?? "g",
		});
	}

	public static async queryAll(): Promise<ManufacturingMethod[]> {
		const rows = await db`SELECT * FROM ManufacturingMethod ORDER BY ShortName ASC`;
		return rows.map(ManufacturingMethodServe.fromSQLRow);
	}

	public static async insert(method: Omit<ManufacturingMethod, never>): Promise<void> {
		await db`
			INSERT INTO ManufacturingMethod (ShortName, WholeName, Description, Icon, Benefits, Cons, LearnMoreURL, Company, Unit)
			VALUES (
				${method.shortName}, ${method.wholeName}, ${method.description},
				${method.icon ?? null}, ${method.benefits}, ${method.cons},
				${method.learnMoreURL ?? null}, ${(method as any).company ?? null}, ${(method as any).unit ?? "g"}
			)
			ON CONFLICT (ShortName) DO NOTHING
		`;
	}

	public static async update(method: ManufacturingMethod): Promise<void> {
		await db`
			UPDATE ManufacturingMethod SET
				WholeName = ${method.wholeName},
				Description = ${method.description},
				Icon = ${method.icon ?? null},
				Benefits = ${method.benefits},
				Cons = ${method.cons},
				LearnMoreURL = ${method.learnMoreURL ?? null},
				Company = ${(method as any).company ?? null},
				Unit = ${(method as any).unit ?? "g"}
			WHERE ShortName = ${method.shortName}
		`;
	}

	public static async delete(shortName: string): Promise<void> {
		await db`DELETE FROM ManufacturingMethod WHERE ShortName = ${shortName}`;
	}
}
