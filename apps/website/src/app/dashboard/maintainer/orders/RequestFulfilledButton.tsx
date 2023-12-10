"use client"

import { setRequestFulfilled } from "@/app/api/server-actions/maintainer";
import { useTransition } from "react";

export default function RequestFulfilledButton({request, className}: {request: number, className?: string})
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
        Fulfilled
    </div>
}