import db from "@/app/api/Database";

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