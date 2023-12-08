'use client'

import { setPartPrinter } from "@/app/api/server-actions/maintainer";
import { ChangeEventHandler, useState, useTransition } from "react";

export function InlinePrinterSelector({ selection, printers, fill, hoveredColor, className, partId }: 
    { 
        printers: {name: string, model: string}[],
        partId: number;
        selection?: string;
        fill?: string; 
        hoveredColor?: string; 
        className?: string;
    }) 
{
    var [what, what2] = useTransition();

    printers = printers ?? [];
    fill = fill ?? 'fill-slate-200';
    hoveredColor = hoveredColor ?? 'fill-slate-400';

    const [isAssigned, assign] = useState<boolean>();

    return <select
        defaultValue={selection == null ? 'unassigned' : selection}
        placeholder=""
        className={`bg-transparent ${selection == 'unassigned' ? 'text-red-400' : ''} ${className}`}
        // className={`bg-transparent ${className}`}
        onChange={ev => what2(async () => {
            assign(ev.currentTarget.value === 'unassigned');

            console.log("What!?");
            // var data = new FormData();
            // data.append("part_id", partId.toString());
            // data.append("printer_name", ev.target.value);
            // await setPartPrinter("", data);
        })}
        // onInput={event => { setSelection(event.currentTarget.value); event.preventDefault(); console.log(event.currentTarget); }}
    >
        <option disabled value="unassigned">Unassigned</option>
        {printers.map(option => <option value={option.name}>{option.model}</option>)}
    </select>;
}
