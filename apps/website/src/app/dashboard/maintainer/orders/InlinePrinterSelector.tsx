"use client"

import { Key, useState } from 'react';

export function InlinePrinterSelector({ selectedPrinter, fill, hoveredColor, className }: { selectedPrinter?: string; fill?: string; hoveredColor?: string; className?: string; }) {
    fill = fill ?? 'fill-slate-200';
    hoveredColor = hoveredColor ?? 'fill-slate-400';
    selectedPrinter = selectedPrinter ?? "unassigned";

    var [selection, setSelection] = useState<string>(selectedPrinter);

    // const printersContext = useContext<PrintersContext>()
    var options: string[] = ["Ender 3 V2", "Ender 5 S1", "Bambu X1C", "Bambu X1E"];

    return <select
        defaultValue={selectedPrinter}
        className={`bg-transparent ${selection == 'unassigned' ? 'text-red-400' : ''} ${className}`}
        onInput={event => { setSelection(event.currentTarget.value); event.preventDefault(); console.log(event.currentTarget); }}
    >
        <option disabled value="unassigned">Unassigned</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>;
}
