"use client"

import { MouseEventHandler, useState, useTransition } from "react";
import { deletePrinter } from "@/app/api/server-actions/printer";

export interface Printer {
  name: string,
  model: string,
  dimensions: number[],
  communicationstrategy: string | null
}

export function PrinterList({initialPrinters} : {initialPrinters: Printer[]}) {
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

  return (
    <>
      <p className="text-red-600">{error}</p>
      <table className="bg-white mt-5 m-auto w-9/10">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left pl-5">Name</th>
            <th className="text-left">Model</th>
            <th className="text-left">Dimensions</th>
            <th className="text-left">Communication Strategy</th>
            <th className='text-left pr-5'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {printers.map((p: Printer) => <tr key={p.name}>
            <td className='text-left pl-5'>{p.name}</td>
            <td className='text-left'>{p.model}</td>
            <td className='text-left'>{p.dimensions[0]} x {p.dimensions[1]} x {p.dimensions[2]}</td>
            <td className='text-left'>{p.communicationstrategy}</td>
            <td className='text-left pr-5'><button className='bg-red-500 p-1 rounded-lg border-none' onClick={(e) => clickHandler(p.name)}>Delete</button></td>
          </tr>)}
        </tbody>
      </table>
    </>
  )
}