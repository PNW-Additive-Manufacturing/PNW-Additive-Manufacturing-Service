import { ChangeEvent, MutableRefObject, useState } from "react";

function FilamentMaterialItem({material, onDelete}: {material: string, onDelete: (material: string) => void}) {
  return <span>
    {material.toUpperCase()}<span onClick={e => onDelete(material)}>X</span>
  </span>
}

export function SupportedFilaments({filamentOptions, materialRef}: {filamentOptions: string[], materialRef: MutableRefObject<string[]>}) {
  let [materials, setMaterials] = useState([] as string[]);
  
  let onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let val = e.target.value;
    if(!materials.find((f) => f === val)) {
      let newArr = materials.slice(0);
      newArr.push(val);
      materialRef.current = newArr;
      setMaterials(newArr);
    }
  };
  return (
    <>
      <select onChange={onChange}>
        {filamentOptions.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
      </select>
      {materials.map(f => <input key={f} type="hidden" name="supported_materials" value={f}/>)}
      <div>
        {materials.map(f => <FilamentMaterialItem 
          key={f} 
          material={f} 
          onDelete={material => setMaterials(materials.filter((f) => f !== material))}
        />)}
      </div>
    </>
  );
}