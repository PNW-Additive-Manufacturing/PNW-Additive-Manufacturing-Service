"use client"

import Filament, { getMaterials } from "@/app/Types/Filament/Filament";
import { useMemo, useState } from "react";

type FilamentManagerProps = {
    filaments: Filament[];
};

export default function FilamentManager({ filaments }: FilamentManagerProps) {

    // An array of the materials of each provide filament.
    const materials = useMemo(() => getMaterials(filaments), [filaments]);

    return <div>

        {materials.map(m => {

            return <FilamentMaterialGroup material={m} filaments={filaments.filter(f => f.material == m)}></FilamentMaterialGroup>

        })}

    </div>

}

function FilamentMaterialGroup({ material, filaments }: { material: string, filaments: Filament[] }) {
    return <div>

        <h1>{material}</h1>

        <div className="flex flex-col gap-4">
            {filaments.map(f => <>
                <FilamentEntry filament={f}></FilamentEntry>
                <hr />
            </>)}


            <FilamentWizard material={material} onCreate={() => { }}></FilamentWizard>
        </div>

    </div>
}

/**
 * A wizard which creates filament entries.
 */
function FilamentWizard({ material, onCreate }: FilamentWizardProps) {
    const [isCreating, setIsCreating] = useState(false);

    return <div>
        <div
            className="rounded-md border-dashed border-2 px-4 border-pnw-gold w-full h-full bg-pnw-gold-light flex gap-4 max-lg:justify-center max-lg:text-center items-center" style={{ minHeight: "5.5rem" }}>
            <div>
                <h2>Add a new {material}</h2>
                {/* <p className="text-xs mt-2">Models must be in <span className="font-bold">Millimeters</span> and <span className="font-bold text-nowrap">{"<"} 20 MB</span></p> */}
            </div>
        </div>
    </div>
}

type FilamentEntryProperties = {
    filament: Filament;
    onChange?: (property: "inventory" | "delete", value: any) => void;
};

export function FilamentEntry({ filament }: FilamentEntryProperties) {
    return <div className="flex gap-4 px-4 py-2">
        {filament.color.name}
    </div>
}

type FilamentWizardProps = {
    material: string;
    onCreate: (filament: Filament) => void;
};