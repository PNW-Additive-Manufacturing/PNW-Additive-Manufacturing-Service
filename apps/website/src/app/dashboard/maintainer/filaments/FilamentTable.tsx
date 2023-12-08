"use client"

import { useState, useTransition } from "react";
import { deleteFilament } from "@/app/api/server-actions/maintainer";

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

  return (
    <>
      <p className="text-red-600">{error}</p>
      <h1 className="text-left">Filaments</h1>
      <table className="bg-white mt-5 m-auto w-9/10">
        <thead>
          <tr className="text-gray-400">
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
            <td className='text-left'>{f.instock ? "true" : "false"}</td>
            <td className='text-left pr-5'><button className='bg-red-500 p-1 rounded-lg border-none' onClick={(e) => clickHandler(f.material, f.color)}>Delete</button></td>
          </tr>)}
        </tbody>
      </table>
    </>
  )
}

