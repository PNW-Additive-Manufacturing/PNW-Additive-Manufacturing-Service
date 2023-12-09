'use client'

import { setPartPrinter } from '@/app/api/server-actions/maintainer';
import { Key, useState, useTransition } from 'react';

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
    var [isPending, transition] = useTransition();

    printers = printers ?? [];
    fill = fill ?? 'fill-slate-200';
    hoveredColor = hoveredColor ?? 'fill-slate-400';

    return <select 
        defaultValue={selection == null ? 'unassigned' : selection}
        className={`bg-transparent ${className}`}
        onChange={ev => transition(async () => {
            var data = new FormData();
            data.append("part_id", partId.toString());
            data.append("printer_name", ev.target.value);
            await setPartPrinter("", data);
        })}
    >
        <option value="unassigned">Unassigned</option>
        {printers.map(option => <option key={option.name} value={option.name}>{option.model}</option>)}
    </select>;
}
