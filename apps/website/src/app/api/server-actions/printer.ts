"use server"

import db from "@/app/api/Database";
import { Printer } from "@/app/dashboard/maintainer/printers/PrinterList";
import { redirect } from "next/navigation";


export async function addPrinter(prevState: string, formData: FormData) : Promise<{error: string | null, printer: Printer | null}> {
  let name = formData.get("printer-name") as string;
  let model = formData.get("printer-model") as string;
  let dimensions = [
    Number(formData.get("printer-dimension1")),
    Number(formData.get("printer-dimension2")),
    Number(formData.get("printer-dimension3")),
    
  ];
  let supportedMaterials: string[] = formData.getAll("supported_materials") as string[];
  let communicationStrat = formData.get("printer-communication") as string;
  let communicationStratOptions = formData.get("printer-communication-options") as string;

  try {
    let res = await db`insert into printer (name, model, dimensions, supportedmaterials, communicationstrategy, communicationstrategyoptions)
    values(${name},${model},${dimensions},${supportedMaterials},${communicationStrat},${communicationStratOptions}) returning name`;
  
    if(res.count == 0) {
      return {error: "Failed to add printer", printer: null};
    }
  } catch(e: any) {
    return {error: "Failed to add printer with error: " + e.message, printer: null};
  }

  //successful!

  return {error: null, printer: {name: name, model: model, dimensions: dimensions, communicationstrategy: communicationStrat, supportedMaterials, communicationoptions: communicationStratOptions}}

}

export async function deletePrinter(prevState: string, formData: FormData) : Promise<string> {
  let name = formData.get("printer-name") as string;

  try {
    //check if a part is currently being printed on the selected printer
    let [row] = await db`select count(*) > 0 as printing from part where assignedprintername=${name} and status='printing'`;
    if(Boolean(row.printing)) {
      return "Cannot delete a printer while it is printing!";
    }

    await db`delete from printer where name=${name}`;
  } catch(e: any) {
    return "Cannot delete printer due to following error: " + e.message;
  }

  return "";
}