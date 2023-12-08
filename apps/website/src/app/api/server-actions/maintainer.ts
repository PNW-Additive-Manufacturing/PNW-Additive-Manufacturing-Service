"use server"

import db from "@/app/api/Database";
import { redirect } from "next/navigation";

export async function setPartPrinter(prevState: string, data: FormData): Promise<string>
{
    var partId = data.get("part_id") as string;
    var printerName = data.get("printer_name") as string;

    let result = await db`update part set AssignedPrinterName=${printerName} where id=${partId} returning id`;

    if(result.count == 0) {
        return "No part found";
    }

    return "";
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