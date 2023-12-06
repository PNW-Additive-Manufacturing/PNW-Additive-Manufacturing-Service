import postgres from "postgres"
import db from "@/app/api/Database"

export async function getModel(modelid: number): Promise<postgres.Row> {
    const res = await db`select * from model where id = ${modelid} order by id`
    let entries = res.entries()
    let next = entries.next();
    let r : postgres.Row;
    r = next.value[1];
    return r;
}