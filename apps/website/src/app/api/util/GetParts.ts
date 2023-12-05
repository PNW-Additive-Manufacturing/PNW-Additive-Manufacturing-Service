import postgres from "postgres"
import db from "@/app/api/Database"

export async function getParts(requestid: string): Promise<Array<postgres.Row>> {
    const res = await db`select * from part where requestid = ${requestid} order by id`
    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r;
}