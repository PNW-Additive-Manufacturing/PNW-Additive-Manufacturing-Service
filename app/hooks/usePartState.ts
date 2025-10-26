import { useCallback } from "react";
import { modifyPart } from "../api/server-actions/maintainer";
import Part from "../Types/Part/Part";
import useAPIFormState from "./useAPIFormState";

/**
 * A hook to modify the data of a Part!
 */
export default function usePartModifier()
{
    let { result, formAction, isPending } = useAPIFormState(modifyPart);
    
    const doUpdate = useCallback((original: Part, modified: Partial<Pick<Part, "status" | "priceInDollars"> & {supplementedFilamentMaterial: string, supplementedFilamentName: string, supplementReason?: string}>) => {

        const data_to_update = new FormData();

        data_to_update.set("partId", (original || modified).id.toString());

        // Update status if changed.
        if (modified.status != null && modified.status != original.status) data_to_update.set("status", modified.status);
        // Update the supplemented filament if changed.
        console.log(typeof(modified.supplementedFilamentMaterial), typeof(original.supplementedFilament?.material));


        const isFilamentChanged = typeof(modified.supplementedFilamentMaterial) != "undefined"
            && typeof(modified.supplementedFilamentName) != "undefined"
            && modified.supplementedFilamentMaterial != original.supplementedFilament?.material 
            && modified.supplementedFilamentName != original.supplementedFilament?.color.name

        if (isFilamentChanged)
        {
            data_to_update.set("material", modified.supplementedFilamentMaterial as any);
            data_to_update.set("color", modified.supplementedFilamentName as any);
            data_to_update.set("supplement-reason", modified.supplementReason as any);
        }
        // Update the cost in dollars if changed.
        if (modified.priceInDollars != null && modified.priceInDollars != original.priceInDollars)
        {
            data_to_update.set("costInDollars", modified.priceInDollars as any); 
        }

        console.log(original, modified);
        
        console.log(data_to_update);
        console.log(formAction(data_to_update));

    }, []);

    return { 
        result,
        updatePart: doUpdate,
        isPending 
    };
}