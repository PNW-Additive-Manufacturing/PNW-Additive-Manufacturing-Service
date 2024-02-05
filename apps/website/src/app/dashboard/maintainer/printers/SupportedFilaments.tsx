import { ChangeEvent, MutableRefObject, useState } from "react";

function FilamentMaterialItem({material, onDelete}: {material: string, onDelete: (material: string) => void}) {
  return <span className="rounded p-1 mr-2 hover:cursor-pointer bg-slate-200" onClick={e => onDelete(material)}>
    {material.toUpperCase()}<span className="pl-2 font-extrabold">X</span>
  </span>
}

export function SupportedFilaments({filamentOptions, materialRef}: {filamentOptions: string[], materialRef: MutableRefObject<string[]>}) {
  let [materials, setMaterials] = useState([] as string[]);
  
  let onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let val = e.target.value;
    if(val && !materials.find((f) => f === val)) {
      let newArr = materials.slice(0);
      newArr.push(val);
      materialRef.current = newArr;
      setMaterials(newArr);
    }
  };
  return (
    <>
      <select className="p-2 rounded" onChange={onChange}>
        <option value="" defaultChecked={true}>--Select a Filament--</option>
        {filamentOptions.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
      </select>
      {materials.map(f => <input key={f} type="hidden" name="supported_materials" value={f}/>)}
      <div className="mt-2 p-2">
        {materials.map(f => <FilamentMaterialItem 
          key={f} 
          material={f} 
          onDelete={material => setMaterials(materials.filter((f) => f !== material))}
        />)}
      </div>
    </>
  );
}