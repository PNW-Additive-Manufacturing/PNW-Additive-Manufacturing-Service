"use client"

import { setPartState } from "@/app/api/server-actions/maintainer";
import { Part } from "@/app/api/util/Constants";
import { useTransition } from "react";

export default function PartAcceptButton({part, className}: {part: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("part_id", part.toString());
            data.append("state", 'queued');
            var error = await setPartState("", data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-opacity-60 bg-emerald-600 hover:cursor-pointer hover:bg-opacity-100 ${className}`}>
        {isPending ? 'Pending...' : 'Accept'}
    </div>
}