import { useState } from "react"

// An inline span representing a user.
export default function PrinterSpan({name, color, dimensions, className}: {name: string, color: string, dimensions: [number, number, number], className?: string}) {
    const [isDetailed, setDetailed] = useState<boolean>();

    var info = name;
    if (isDetailed) {
        info += ` ${dimensions.join("x")}`;
    }

    return <span 
        className={"inline rounded-md pl-2 pr-2 pt-0.5 pb-0.5 hover:cursor-pointer"+(className ||"")}
        style={{backgroundColor: color}}
        onMouseEnter={() => setDetailed(true)}
        onMouseLeave={() => setDetailed(false)}>
        {info}
    </span>
}