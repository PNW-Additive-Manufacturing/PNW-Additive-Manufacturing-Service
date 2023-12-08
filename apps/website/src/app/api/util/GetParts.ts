import postgres from "postgres"
import db from "@/app/api/Database"
import { Part } from "@/app/api/util/Constants";

export async function getParts(requestid: number): Promise<Part[]> {
    const parts:Array<postgres.Row> = await db`select * from part where requestid = ${requestid} order by id`;
    const models:Array<postgres.Row> = await db`select * from model where id in ${db(parts.map(p => p.modelid))} order by id`;
    const filaments:Array<postgres.Row> = await db`select * from filament where id in ${db(parts.map(p => p.assignedfilamentid))} order by id`;

    const Parts: Part[] = [];
    parts.forEach((part, index) => {
        let model = models[index];
        let filament = filaments.find(f => f.id === part.assignedfilamentid);
        Parts.push({
            partid: part.id,
            requestid: part.requestid,
            modelid: part.modelid,
            quantity: part.quantity,
            status: part.status,
            modelname: model.name,
            filamentmaterial: filament?.material,
            filamentcolor: filament?.color
        });
    });
    return Parts;
}