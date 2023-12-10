"use client"

import { ChangeEvent, useState, useEffect } from "react";


export function FilamentSelector({filaments, defaultValue, nameTransform}: 
  {filaments: Array<{material: string, color: string}>, defaultValue?: number, nameTransform?: (name: string) => string}) 
{

  if(filaments.length == 0) {
    return (
      <>
        <p id="filament-client-error" className="text-sm text-red-500">
          No filament is in stock, please tell us which material and color
          you would want to use for your part in the Notes field.
        </p>
        <input type="hidden" name="material" value=""/>
        <input type="hidden" name="color" value=""/>
      </>
    );
  }

  let [error, setError] = useState("");


  //get list of all unique colors and materials
  let colorSet = new Set<string>();
  let materialSet = new Set<string>()

  for(let filament of filaments) {
    colorSet.add(filament.color);
    materialSet.add(filament.material);
  }

  //convert sets to arrays so that we can call Array.map
  let colors = Array.from(colorSet);
  let materials = Array.from(materialSet);

  
  let [selectedMaterial, setSelectedMaterial] = useState(filaments[0].material);
  let [selectedColor, setSelectedColor] = useState(filaments[0].color);

  
  //useEffect is called after each React render call when one of the variables from useState in the dependency
  //list (2nd parameter) are changed.
  useEffect(() => {
    console.log(selectedColor, selectedMaterial);
    if(!selectedColor || !selectedMaterial) {
      setError('');
    }
    else if(!filaments.find((f => f.color == selectedColor && f.material == selectedMaterial))) {
      setError(`The filament "${selectedColor} ${selectedMaterial.toUpperCase()}" is out of stock!`);
    } else {
      setError('');
    }
     //when any variables in this list are changed, the useEffect callback will be called
  }, [filaments, selectedColor, selectedMaterial]);
  


  let onChangeMaterial = function (e: ChangeEvent<HTMLSelectElement>) {
    //will call callback in useEffect function
    setSelectedMaterial(e.target.value);
  };

  let onChangeColor = function (e: ChangeEvent<HTMLSelectElement>) {
    //will call callback in useEffect function
    setSelectedColor(e.target.value);
  };

  return (
    <>
      <select className="bg-transparent" id='filament-material' name={nameTransform ? nameTransform("material") : "material"} onChange={onChangeMaterial} defaultValue={selectedMaterial}>
        {materials.map((m, index) => <option key={m} value={m.toLowerCase()}>{m.toUpperCase()}</option>)}
        <option value="">Other</option>
      </select>
      <select className="bg-transparent" id="filament-color" name={nameTransform ? nameTransform("color") : "color"} onChange={onChangeColor} defaultValue={selectedColor}>
        {colors.map((c, index) => <option key={c} value={c.toLowerCase()}>{c.toLowerCase()}</option>)}
        <option value="">Other</option>
      </select>
      <p id="filament-client-error" className="text-sm text-red-500">{error}</p>
    </>
  );
}
