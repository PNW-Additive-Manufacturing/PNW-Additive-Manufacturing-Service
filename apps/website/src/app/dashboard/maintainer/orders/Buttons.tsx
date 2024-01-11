"use client"

import { setPartState, setRequestFulfilled} from "@/app/api/server-actions/maintainer";
import { useTransition } from "react";

export function PartAcceptButton({part, className}: {part: number, className?: string})
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

export function PartDenyButton({part, className}: {part: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("part_id", part.toString());
            data.append("state", 'denied');
            var error = await setPartState("", data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-opacity-60 bg-red-500 hover:cursor-pointer hover:bg-opacity-100 ${className}`}>
        Decline
    </div>
}

export function PartBeginPrintingButton({part, className}: {part: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("part_id", part.toString());
            data.append("state", 'printing');
            var error = await setPartState("", data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-gray-400 hover:cursor-pointer hover:bg-gray-500 ${className}`}>
        Begin Printing
    </div>
}

export function PartCompleteButton({part, className}: {part: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("part_id", part.toString());
            data.append("state", 'printed');
            var error = await setPartState("", data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-opacity-60 bg-emerald-600 hover:cursor-pointer hover:bg-opacity-100 ${className}`}>
        Printed
    </div>
}

export function PartFailedButton({part, className}: {part: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("part_id", part.toString());
            data.append('state', 'failed');
            var error = await setPartState("", data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-opacity-60 bg-red-500 hover:cursor-pointer hover:bg-opacity-100 ${className}`}>
        Failed
    </div>
}

export function RequestFulfilledButton({request, className}: {request: number, className?: string})
{
    const [isPending, transition] = useTransition();

    return <div 
        onClick={() => transition(async () => {
            var data = new FormData();
            data.append("request_id", request.toString());
            data.append("isfulfilled", 'true');
            var error = await setRequestFulfilled(data);

            if (error != '') console.error(error);
        })}
        className={`text-base px-2 py-1 w-fit text-white rounded-md bg-opacity-60 bg-emerald-600 hover:cursor-pointer hover:bg-opacity-100 ${className}`}>
        Completed
    </div>
}