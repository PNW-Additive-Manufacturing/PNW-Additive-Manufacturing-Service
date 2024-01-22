"use client"

import { ChangeEvent, Dispatch, SetStateAction, useState, useTransition } from "react";
import { deleteFilament, setFilamentInStock } from "@/app/api/server-actions/maintainer";
import Table from "@/app/components/Table";
import DropdownSection from "@/app/components/DropdownSection";
import { FilamentForm } from "./FilamentForm";

export interface Filament {
  material: string,
  color: string,
  instock: boolean
}


export function FilamentList({initialFilaments} : {initialFilaments: Filament[]}) {
  var [filaments, setFilamentList] = useState(initialFilaments);
  var [pending, startTransition] = useTransition();
  var [error, setError] = useState("");

  let clickHandler = (filamentMaterial: string, filamentColor: string) => {
    startTransition(async () => {
      let form = new FormData();
      form.append("filament-material", filamentMaterial);
      form.append("filament-color", filamentColor);

      let errorMessage = await deleteFilament(error, form);
      if(errorMessage) {
        setError(errorMessage);
        return;
      }

      setFilamentList(filaments.filter((f) => f.material !== filamentMaterial || f.color !== filamentColor));
    })
  };

  let changeHandler = (e: ChangeEvent<HTMLSelectElement>, filament: Filament) => {
    if((e.target.value === "true") === filament.instock) {
      return;
    }

    let newInStock = e.target.value;

    startTransition(async () => {
      let form = new FormData();
      form.append("filament-material", filament.material);
      form.append("filament-color", filament.color);
      form.append("filament-instock", newInStock);

      let errorMessage = await setFilamentInStock('', form);
      if(errorMessage) {
        setError(errorMessage);
        return;
      }

      setFilamentList(filaments.map((f) => {
        if(f.material === filament.material && f.color === filament.color) {
          f.instock = newInStock === "true";
        }
        return f;
      }))

    });

  };

  let onAddCallback =  (newMaterial: string, newColor: string, instock: boolean) => {
    let newList = filaments.slice();
    newList.push({material: newMaterial, color: newColor, instock: instock});
    setFilamentList(newList);
  };
 


  return (
    <>
		  <DropdownSection name="Filaments" collapsible={true}>

        <p className="text-red-600">{error}</p>
        <Table>
          <thead>
            <tr className="">
              <th className="text-left pl-5">Material</th>
              <th className="text-left">Color</th>
              <th className="text-left">In Stock</th>
              <th className='text-left pr-5'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filaments.map((f: Filament) => <tr key={f.material + f.color}>
              <td className='text-left pl-5'>{f.material.toUpperCase()}</td>
              <td className='text-left'>{f.color}</td>
              <td className='text-left'>
                <select className="bg-transparent" onChange={(e) => changeHandler(e, f)} defaultValue={f.instock ? "true" : "false"}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </td>
              <td className='text-left pr-5'><button className='bg-red-600 px-2 py-1 w-fit rounded-lg border-none' onClick={(e) => clickHandler(f.material, f.color)}>Delete</button></td>
            </tr>)}
          </tbody>
        </Table>
      </DropdownSection>

      <DropdownSection name="Add Filament" className='mt-8' hidden={true}>
			  <FilamentForm onAddCallback={onAddCallback}/>
		  </DropdownSection>
    </>
  )
}