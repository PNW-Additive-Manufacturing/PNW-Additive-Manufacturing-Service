"use client"

import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { SupportedFilaments } from "./SupportedFilaments";
import { useState } from "react";
import { Printer } from "./PrinterList";
import { addPrinter } from "@/app/api/server-actions/printer";

export function PrinterForm({addPrinterCallback, filamentOptions} : {addPrinterCallback: (p: Printer) => void, filamentOptions: string[]}) {
  let [nameField, setNameField] = useState("");
  let [modelField, setModelField] = useState("");
  let [dimensionField1, setDimensionField1] = useState("");
  let [dimensionField2, setDimensionField2] = useState("");
  let [dimensionField3, setDimensionField3] = useState("");

  let [materials, setMaterials] = useState([] as string[]);
  let [selectedMaterial, setSelectedMaterial] = useState("");

  let [stratField, setStratField] = useState("");
  let [optionsField, setOptionsField] = useState("");
  
  let addPrinterAction = async (prevState: string, formData: FormData) => {
    let result = await addPrinter(prevState, formData);
    if(result.error) {
      return result.error;
    }

    setDimensionField1("");
    setDimensionField2("");
    setDimensionField3("");

    setModelField("");
    setNameField("");
    setStratField("");
    setOptionsField("");

    setMaterials([]);
    setSelectedMaterial("");


    addPrinterCallback(result.printer!);
      
    return "";
  };


  return (
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
      <p className="font-semibold w-full p-2 br-2 mb-2">Supported Filament Materials</p>
      <SupportedFilaments currentMaterials={materials} setMaterialCallback={setMaterials} filamentOptions={filamentOptions} selectedFilament={selectedMaterial} setSelectedFilament={setSelectedMaterial}/>

      <Input label="Communication Strategy" name="printer-communication" type="text" id="printer-communication" placeholder="MoonRaker, Serial, or Bambu" value={stratField} onChange={(e) => setStratField(e.target.value)}/>
      <Input label="Communication Strategy Options" name="printer-communication-options" type="text" id="printer-communication-options" placeholder="Host, Extruder Count, Has Heated Bed" value={optionsField} onChange={e => setOptionsField(e.target.value)}/>
    </GenericFormServerAction>
  );
}