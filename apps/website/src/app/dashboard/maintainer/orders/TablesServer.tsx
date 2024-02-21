"use server"

import db from "@/app/api/Database";
import { RunningPartsTable, QueuedPartsTable, PendingReviewPartsTable, RequestsTable } from "./TablesClient";

export async function RunningPartsTableServer() {
    var parts = await db`select p.*, owneremail from part as p, request as r where (p.status='printing' or p.status='printed' or p.status='failed') and p.requestid = r.id`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return <RunningPartsTable parts={parts} filaments={filaments} models={models} printers={printers}></RunningPartsTable>
}

export async function QueuedPartsTableServer() {
    var parts = await db`select p.*, r.owneremail from part as p, request as r where p.status='queued' and p.requestid=r.id`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return <QueuedPartsTable parts={parts} filaments={filaments} models={models} printers={printers}></QueuedPartsTable>
}

export async function PendingReviewPartsTableServer() {
    var parts = await db`select p.*, owneremail from part as p, request as r where p.status='pending' and p.requestid = r.id`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;

    return <PendingReviewPartsTable parts={parts} filaments={filaments} models={models}></PendingReviewPartsTable>
}

export async function RequestsTableServer({ isFulfilled } : { isFulfilled : boolean }) {
    const activeRequests = await db`select * from request where isfulfilled=${isFulfilled} order by submittime asc`;
    const parts = await db`select * from part order by id asc;`;

    return <RequestsTable parts={parts} activeRequests={activeRequests} isFulfilled={isFulfilled}></RequestsTable>
}


export async function GetRequestData(request:number) {
    var parts = await db`select * from part where requestid = ${request}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return {parts:parts, filaments:filaments, models:models, printers:printers};
}