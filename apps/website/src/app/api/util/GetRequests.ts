import postgres from "postgres"
import db from "@/app/api/Database"

export async function getRequests(email: string, isFulfilled: boolean): Promise<Array<postgres.Row>> {
    const res = await db`select * from request where owneremail = ${email} and isfulfilled = ${isFulfilled} order by submittime desc`
    //since isFulfilled is not updated in Request table, check to see if there are any parts in the request that do not have the printed status to see if the request is fulfilled
    //const res = await db`select * from request as r where r.owneremail = ${email} and ((select COUNT(*) from part as p where r.id=p.requestid and p.status!='printed')=0)=${isFulfilled} order by submittime desc`

    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r;
}