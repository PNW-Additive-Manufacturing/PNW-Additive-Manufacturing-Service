import { useState } from "react"

// An inline span representing a user.
export default function UserSpan({name, className}: {name: string, className?: string}) {
    const [isDetailed, setDetailed] = useState<boolean>();

    var info = name;
    if (isDetailed) {
        // info += ` (Joined ${registered})`;
    }

    return <span 
        className={"bg-pnw-gold-light inline rounded-md pl-2 pr-2 pt-1 pb-1 hover:cursor-pointer"+(className || "")}
        onMouseEnter={() => setDetailed(true)}
        onMouseLeave={() => setDetailed(false)}>
        {info}
    </span>
}