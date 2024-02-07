"use client"

import {useState, useTransition } from "react";
import { deletePrinter } from "@/app/api/server-actions/printer";
import DropdownSection from "@/app/components/DropdownSection";
import { PrinterForm } from "./PrinterForm";

export interface Printer {
  name: string,
  model: string,
  supportedMaterials: string[],
  dimensions: number[],
  communicationstrategy: string | null,
  communicationoptions?: string 
}

export function PrinterList({initialPrinters, filamentMaterials} : {initialPrinters: Printer[], filamentMaterials: string[]}) {
  var [printers, setPrinters] = useState(initialPrinters);
  var [pending, startTransition] = useTransition();
  var [error, setError] = useState("");



  let clickHandler = (printerName: string) => {
    startTransition(async () => {
      let form = new FormData();
      form.append("printer-name", printerName);
      let errorMessage = await deletePrinter(error, form);
      if(errorMessage) {
        setError(errorMessage);
        return;
      }

      setPrinters(printers.filter((p) => p.name !== printerName));
    })
  };

  let addPrinterCallback = (p: Printer) => {
    let newList = printers.slice();
    newList.push(p);
    setPrinters(newList);

    window.scrollTo({
      top: 0,

      behavior: "smooth"
    });
  };

  

  return (
    <>
		  <DropdownSection name='Printers' collapsible={true}>

        <p className="text-red-600">{error}</p>
        <table className="bg-white w-full">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pl-5">Name</th>
              <th className="text-left">Model</th>
              <th className="text-left">Materials</th>
              <th className="text-left">Dimensions in mm</th>
              <th className="text-left">Communication Strategy</th>
              <th className='text-left pr-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {printers.map((p: Printer) => <tr id={p.name} key={p.name}>
              <td className='text-left pl-5'>{p.name}</td>
              <td className='text-left'>{p.model}</td>
              <td className='text-left'>{p.supportedMaterials.join(",")}</td>
              <td className='text-left'>{p.dimensions[0]} x {p.dimensions[1]} x {p.dimensions[2]}</td>
              <td className='text-left'>{p.communicationstrategy}</td>
              <td className='text-left pr-2'><button className='bg-red-500 p-1 rounded-lg border-none' onClick={(e) => clickHandler(p.name)}>Delete</button></td>
            </tr>)}
          </tbody>
        </table>
      </DropdownSection>

      <DropdownSection hidden={true} name='Configure new Printer' className='mt-8'>
        <PrinterForm addPrinterCallback={addPrinterCallback} filamentOptions={filamentMaterials}/>
		  </DropdownSection>
    </>
  )
}