import db from "@/app/api/Database";
import postgres from "postgres";
import { Material, MaterialSchema } from "./Material";

export default class MaterialServe {
	public static fromSQLRow(row: postgres.Row): Material {
		return MaterialSchema.parse({
			shortName: row.shortname,
			wholeName: row.wholename,
			description: row.description ?? "",
			icon: row.icon ?? undefined,
			benefits: row.benefits ?? [],
			cons: row.cons ?? [],
			learnMoreURL: row.learnmoreurl ?? undefined,
		});
	}

	public static async queryAll(): Promise<Material[]> {
		const rows = await db`SELECT * FROM Material ORDER BY ShortName ASC`;
		return rows.map(MaterialServe.fromSQLRow);
	}

	public static async insert(material: Material): Promise<void> {
		await db`
			INSERT INTO Material (ShortName, WholeName, Description, Icon, Benefits, Cons, LearnMoreURL)
			VALUES (
				${material.shortName}, ${material.wholeName}, ${material.description},
				${material.icon ?? null}, ${material.benefits}, ${material.cons},
				${material.learnMoreURL ?? null}
			)
			ON CONFLICT (ShortName) DO NOTHING
		`;
	}

	public static async update(material: Material): Promise<void> {
		await db`
			UPDATE Material SET
				WholeName = ${material.wholeName},
				Description = ${material.description},
				Icon = ${material.icon ?? null},
				Benefits = ${material.benefits},
				Cons = ${material.cons},
				LearnMoreURL = ${material.learnMoreURL ?? null}
			WHERE ShortName = ${material.shortName}
		`;
	}

	public static async delete(shortName: string): Promise<void> {
		await db`DELETE FROM Material WHERE ShortName = ${shortName}`;
	}
}
