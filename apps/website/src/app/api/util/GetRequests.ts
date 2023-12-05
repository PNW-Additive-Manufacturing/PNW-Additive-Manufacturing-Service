import postgres from "postgres"
import db from "@/app/api/Database"

export async function getRequests(email: string, isFulfilled: boolean): Promise<Array<postgres.Row>> {
    const res = await db`select * from request where owneremail = ${email} and isfulfilled = ${isFulfilled} order by submittime`
    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r;
}