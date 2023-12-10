"use server"

import db from "@/app/api/Database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
        case "failed":
            // TODO: Add failed reason.
        case 'printed':
        case 'denied':
        case 'queued':
            await db`update part set status=${state} where id=${partId} returning id`;
            break;
        default:
            return `Unknown state: ${state}`;
    }
    
    revalidatePath('/dashboard/maintainer');
    return '';
}

export async function setRequestFulfilled(data: FormData): Promise<string>
{
    var requestId = data.get("request_id") as string;
    var isfulfilled = data.get("isfulfilled") as string;
    if (requestId == null) return "Missing argument: request_id";
    if (isfulfilled == null) return "Missing argument: isfulfilled"

    var request = await db`select status from request where id=${requestId}`;
    if (request.count == 0) return "No request found";
    
    await db`update request set isfulfilled=true where id=${requestId} returning id`;
    
    revalidatePath('/dashboard/maintainer');
    return '';
}

export async function addFilament(prevState: string, data: FormData) : Promise<string> {
    var material = (data.get("filament-material") as string).toLowerCase();
    var color = (data.get("filament-color") as string).toLowerCase();

    try {
        let result = await db`insert into filament (material, color, instock) values(${material}, ${color}, true) returning id`;
        if(result.count == 0) {
            return "Failed to add filament!";
        }
    } catch(e: any) {
        return "Failed to add filament with error: " + e.message;
    }

    //successful
    redirect("/dashboard/maintainer/filaments");
}

export async function setFilamentInStock(prevState: string, data: FormData): Promise<string> {
    var material = (data.get("filament-material") as string).toLowerCase();
    var color = (data.get("filament-color") as string).toLowerCase();
    var instock = (data.get("filament-instock") as string) === "true";


    try {
        await db`update filament set instock=${instock} where material=${material} and color=${color}`;
    } 
    catch(e: any) 
    {
        return "Failed to update filament with error: " + e.message;
    }

    return "";
}

export async function deleteFilament(prevState: string, data: FormData) : Promise<string> {
    var material = (data.get("filament-material") as string).toLowerCase();
    var color = (data.get("filament-color") as string).toLowerCase();

    try {
        await db`delete from filament where material=${material} and color=${color}`;
    } catch(e: any) {
        return "Failed to add filament with error: " + e.message;
    }

    return "";
}
