"use server"

import db from "@/app/api/Database";
import { revalidatePath } from "next/cache";

export async function setPartPrinter(prevState: string, data: FormData): Promise<string>
{
    var partId = data.get("part_id") as string;
    var printerName = data.get("printer_name") as string

    let result = await db`update part set AssignedPrinterName=${printerName == 'unassigned' ? null : printerName} where id=${partId} returning id`;

    if(result.count == 0) return "No part found";

    return "";
}

export async function setPartState(prevState: string, data: FormData): Promise<string>
{
    var partId = data.get("part_id") as string;
    var state = data.get("state") as string;
    if (partId == null) return "Missing argument: part_id";
    if (state == null) return "Missing argument: state"

    var part = await db`select status from part where id=${partId}`;
    if (part.count == 0) return "No part found";
    
    switch (state)
    {
        case "printing":
            await db`update part set status='printing' where id=${partId} returning id`;
            break;
        case "failed":
            // TODO: Add failed reason.
            await db`update part set status='failed' where id=${partId} returning id`;
            break;
        case 'printed':
            await db`update part set status='printed' where id=${partId} returning id`;
            break;
        case 'denied':
            await db`update part set status='printed' where id=${partId} returning id`;
            break;
        case 'queued':
            await db`update part set status='queued' where id=${partId} returning id`;
            break;
        default:
            return `Unknown state: ${state}`;
    }
    
    revalidatePath('/dashboard/maintainer');
    return '';
}