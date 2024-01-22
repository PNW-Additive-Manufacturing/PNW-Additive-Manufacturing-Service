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

export async function setRequestFulfilled(requestId: string, isfulfilled: boolean): Promise<string>
{
    var [request] = await db`update request set isfulfilled=${isfulfilled} where id=${requestId} returning id`;
    if (request.count == 0) return "No request found";
    
    revalidatePath('/dashboard/maintainer');
    return '';
}

export async function addFilament(prevState: string, data: FormData) : Promise<{error: string | null, newMaterial: string | null, newColor: string | null, instock: boolean | null}> {
    var material = (data.get("filament-material") as string).toLowerCase();
    var color = (data.get("filament-color") as string).toLowerCase();

    let newMaterial = null;
    let newColor = null;
    let instock = null;

    try {
        let result = await db`insert into filament (material, color, instock) values(${material}, ${color}, true) returning material, color, instock`;
        if(result.count == 0) {
            return {error: "Failed to add filament!", newColor: null, newMaterial: null, instock: null};
        }
        result[0]
        newMaterial = material.toUpperCase();
        newColor = color.toLowerCase();
        instock = true;

    } catch(e: any) {
        return {error: "Failed to add filament with error: " + e.message, newColor: null, newMaterial: null, instock: null};
    }

    //successful
    return {error: null, newMaterial: newMaterial, newColor: newColor, instock: instock};
    //redirect("/dashboard/maintainer/filaments");
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
