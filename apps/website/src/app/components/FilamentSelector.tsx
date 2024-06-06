"use client"

import { ChangeEvent, useState, useEffect } from "react";

export function FilamentSelector({filaments, defaultMaterial, defaultColor, nameTransform, onChange}: 
  {filaments: Array<{material: string, color: string}>, defaultMaterial?: string, defaultColor?: string, nameTransform?: (name: string) => string, onChange?: (material: string, color: string) => void}) 
{
  if(filaments.length == 0) {
    return (
      <>
        <p id="filament-client-error" className="text-sm text-red-500">No filament is in stock! Use Comments.</p>
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

  let [selectedMaterial, setSelectedMaterial] = useState(defaultMaterial ?? filaments[0].material);
  let [selectedColor, setSelectedColor] = useState(defaultColor ?? filaments[0].color);

  //useEffect is called after each React render call when one of the variables from useState in the dependency
  //list (2nd parameter) are changed.
  useEffect(() => {
    if(!selectedColor || !selectedMaterial) {
      setError('');
    }
    else if(!filaments.find((f => f.color.toLocaleUpperCase() == selectedColor.toUpperCase() && f.material.toUpperCase() == selectedMaterial.toUpperCase()))) {
      setError(`Filament is out of stock!`);
    } else {
      setError('');
    }

     //when any variables in this list are changed, the useEffect callback will be called
  }, [filaments, selectedColor, selectedMaterial]);
  

  let onChangeMaterial = function (e: ChangeEvent<HTMLSelectElement>) {
    //will call callback in useEffect function
    setSelectedMaterial(e.target.value);
    if (onChange != undefined)
    {
      onChange(selectedMaterial.toUpperCase(), selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1));
    }
  };

  let onChangeColor = function (e: ChangeEvent<HTMLSelectElement>) {
    //will call callback in useEffect function
    setSelectedColor(e.target.value);
    
    if (onChange != undefined)
    {
      onChange(selectedMaterial.toUpperCase(), e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
    }
  };

  console.log("Default Mat: ", defaultMaterial);
  console.log("Default Col: ", defaultColor);

  return (
    <>
      <select className="uppercase" id='filament-material' name={nameTransform ? nameTransform("material") : "material"} onChange={onChangeMaterial} defaultValue={selectedMaterial.toLowerCase()}>
        {materials.map((m, index) => <option key={m} value={m.toLowerCase()}>{m.toUpperCase()}</option>)}
      </select>
      <select id="filament-color" name={nameTransform ? nameTransform("color") : "color"} onChange={onChangeColor} defaultValue={selectedColor.toLowerCase()}>
        {colors.map((c, index) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
        <option value="">Any</option>
      </select>
      <p id="filament-client-error" className="text-sm text-red-500">{error}</p>
    </>
  );
}
