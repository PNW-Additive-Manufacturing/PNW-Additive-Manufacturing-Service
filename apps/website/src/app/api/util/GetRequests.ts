import postgres from "postgres"
import db from "@/app/api/Database"
import { Request } from "./Constants";

export async function getRequestsBy(email: string): Promise<Array<postgres.Row>> {
    const res = await db`SELECT r.Id, 
    r.Name, 
    r.OwnerEmail,
    a.FirstName, 
    a.LastName, 
    r.SubmitTime, 
    r.IsFulfilled, 
    r.Notes, 
    COUNT(p.Quantity) AS NumberOfParts
    FROM Request r
    LEFT JOIN Part p ON r.Id = p.RequestId
    JOIN Account a ON r.OwnerEmail = a.Email
    WHERE r.OwnerEmail = ${email}
    GROUP BY r.Id, r.Name, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.IsFulfilled, r.Notes
    ORDER BY r.SubmitTime DESC;`;

    //since isFulfilled is not updated in Request table, check to see if there are any parts in the request that do not have the printed status to see if the request is fulfilled
    //const res = await db`select * from request as r where r.owneremail = ${email} and ((select COUNT(*) from part as p where r.id=p.requestid and p.status!='printed')=0)=${isFulfilled} order by submittime desc`

    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r as Request[];
}

export async function getFulfilledOrders(): Promise<Array<postgres.Row>> {
    const res = await db`select * from request where isfulfilled = true order by submittime desc`
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

export async function getOrdersReadyForPickup(): Promise<Array<postgres.Row>> {
    const res = await db`SELECT FROM Request r
    WHERE r.id NOT IN (
        SELECT requestid
        FROM Part
        WHERE status != 'printed'
    )
    ORDER BY r.submittime DESC;`;

    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r;
}

export async function getAllRequests(): Promise<Array<postgres.Row>> {
    const res = await db`SELECT r.Id, 
    r.Name, 
    r.OwnerEmail,
    a.FirstName, 
    a.LastName, 
    r.SubmitTime, 
    r.IsFulfilled, 
    r.Notes, 
    COUNT(p.Quantity) AS NumberOfParts
    FROM Request r
    LEFT JOIN Part p ON r.Id = p.RequestId
    JOIN Account a ON r.OwnerEmail = a.Email
    GROUP BY r.Id, r.Name, r.OwnerEmail, a.FirstName, a.LastName, r.SubmitTime, r.IsFulfilled, r.Notes
    ORDER BY SubmitTime desc;`;
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

export async function getOrdersWithPartWithStatus(status: string): Promise<Array<postgres.Row>> 
{
    console.log(status)
    const res = await db`SELECT request.id, request.name, COUNT(Part.id) AS number_of_parts
    FROM request
    JOIN Part ON request.id = part.requestid
    WHERE Request.id IN (
        SELECT DISTINCT requestid
        FROM Part
        WHERE status = ${status.toLowerCase()}
    )
    GROUP BY request.id, request.name
    ORDER BY request.submittime DESC;
    `;

    let entries = res.entries()
    let r : Array<postgres.Row> = [];
    while(true) {
        let next = entries.next();
        if(next.done) break;
        r.push(next.value[1]);
    }
    return r;
}

export async function getStatusRequests(status: string): Promise<Array<postgres.Row>> {
    const res = await db`select * from request where status = ${status} order by submittime desc`
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