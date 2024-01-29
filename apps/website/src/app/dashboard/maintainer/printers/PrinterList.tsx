"use client"

import { Dispatch, MouseEventHandler, SetStateAction, createRef, useRef, useState, useTransition } from "react";
import { addPrinter, deletePrinter } from "@/app/api/server-actions/printer";
import DropdownSection from "@/app/components/DropdownSection";
import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { SupportedFilaments } from "./SupportedFilaments";

export interface Printer {
  name: string,
  model: string,
  supportedMaterials: string[],
  dimensions: number[],
  communicationstrategy: string | null
}

export function PrinterList({initialPrinters, filamentMaterials} : {initialPrinters: Printer[], filamentMaterials: string[]}) {
  var [printers, setPrinters] = useState(initialPrinters);
  var [pending, startTransition] = useTransition();
  var [error, setError] = useState("");

  let supportedMaterialsRef = useRef([] as string[]);

  let [nameField, setNameField] = useState("");
  let [modelField, setModelField] = useState("");
  let [dimensionField1, setDimensionField1] = useState("");
  let [dimensionField2, setDimensionField2] = useState("");
  let [dimensionField3, setDimensionField3] = useState("");

  let [stratField, setStratField] = useState("");
  let [optionsField, setOptionsField] = useState("");





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

  let addPrinterAction = async (prevState: string, formData: FormData) => {
    let result = await addPrinter(prevState, formData);
    if(result.error) {
      return result.error;
    }

    let newList = printers.slice();
    newList.push(result.printer!);
    setPrinters(newList);

    setDimensionField1("");
    setDimensionField2("");
    setDimensionField3("");

    setModelField("");
    setNameField("");
    setStratField("");
    setOptionsField("");

    supportedMaterialsRef.current = [];


    window.scrollTo({
      top: 0,

      behavior: "smooth"
    })
      
    return "";
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
        <GenericFormServerAction serverAction={addPrinterAction} submitName="Add Printer" submitPendingName="Adding Printer...">
          <Input label="Printer Name" name="printer-name" type="text" id="printer-name" placeholder="ex: Printer 1" value={nameField} onChange={(e) => setNameField(e.target.value)}/>
          <Input label="Printer Model" name="printer-model" type="text" id="printer-model" placeholder="ex: Creality Ender 3" value={modelField} onChange={(e) => setModelField(e.target.value) }/>
          <div className="font-semibold">
            <p className="uppercase br-2">Dimensions in mm</p>
            <span>
              <input 
                className="w-40 inline-block" 
                type="number" 
                name="printer-dimension1" 
                placeholder="x" 
                value={dimensionField1} 
                onChange={(e) => setDimensionField1(e.target.value)}
              />
              <input 
                className="w-40 inline-block" 
                type="number" 
                name="printer-dimension2" 
                placeholder="y"
                value={dimensionField2}
                onChange={(e) => setDimensionField2(e.target.value)}

              />
              <input 
                className="w-40 inline-block" 
                type="number" 
                name="printer-dimension3" 
                placeholder="z"
                value={dimensionField3}
                onChange={(e) => setDimensionField3(e.target.value)}

              />
            </span>
          </div>
          <SupportedFilaments materialRef={supportedMaterialsRef} filamentOptions={filamentMaterials}/>
          <Input label="Communication Strategy" name="printer-communication" type="text" id="printer-communication" placeholder="MoonRaker, Serial, or Bambu" value={stratField} onChange={(e) => setStratField(e.target.value)}/>
          <Input label="Communication Strategy Options" name="printer-communication-options" type="text" id="printer-communication-options" placeholder="Host, Extruder Count, Has Heated Bed" value={optionsField} onChange={e => setOptionsField(e.target.value)}/>
        </GenericFormServerAction>
		  </DropdownSection>
    </>
  )
}