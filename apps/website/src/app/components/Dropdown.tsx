"use client"

import { RegularChevronDown } from "lineicons-react";
import { ReactNode, useState } from "react";

export default function Dropdown({ name, children, className, toolbar }: 
    { name: string; className?: string, children?: any; toolbar?: ReactNode }) 
{
    var [isHidden, setHidden] = useState<boolean>(false);

    return <div className={"w-full rounded-md outline-dashed outline-gray-200 outline-1 " + className ?? ''}>

        <div 
            className="p-5 bg-gray-100"
            onClick={() => setHidden(!isHidden)}>

            <span className="align-middle w-fit">
                <span className="font-semibold uppercase">{name}</span>
                <span className="ml-4">
                    {(toolbar == null ? <></> : toolbar) as ReactNode}
                </span>
            </span>
            <div className="float-right">
                <RegularChevronDown 
                    className={`w-6 h-6 fill-gray-400 ${isHidden ? 'rotate-180 hover:rotate-0' : 'hover:rotate-180'} hover:cursor-pointer transition-transform`}></RegularChevronDown>
            </div>
            
        </div>

        <div className={isHidden ? 'hidden' : 'block'}>
            {children}
        </div>
    </div>

}
