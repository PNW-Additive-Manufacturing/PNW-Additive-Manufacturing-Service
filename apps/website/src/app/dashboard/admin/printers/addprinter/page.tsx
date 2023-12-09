"use server"

import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { addPrinter } from "@/app/api/server-actions/printer";
import { Navbar } from "@/app/components/Navigation";
export default async function Page() {
  return (
  <main>
      <Navbar links={[
        {name: "Add Printer", path: "/dashboard/admin/printers/addprinter"}
      ]}/>
      <GenericFormServerAction serverAction={addPrinter} submitName="Add Printer" submitPendingName="Adding Printer...">
        <Input label="Printer Name" name="printer-name" type="text" id="printer-name" placeholder="ex: Printer 1"/>
        <Input label="Printer Model" name="printer-model" type="text" id="printer-model" placeholder="Model"/>
        <div className="font-semibold">
          <p className="uppercase br-2">Dimensions</p>
          <span>
            <input className="w-40 inline-block" type="number" name="printer-dimension1"></input>
            <input className="w-40 inline-block" type="number" name="printer-dimension2"></input>
            <input className="w-40 inline-block" type="number" name="printer-dimension3"></input>

          </span>
        </div>
        <Input label="Communication Strategy" name="printer-communication" type="text" id="printer-communication" placeholder="MoonRaker"/>
        <Input label="Communication Strategy Options" name="printer-communication-options" type="text" id="printer-communication-options" placeholder="Options"/>

      </GenericFormServerAction>
    </main>
  );
}