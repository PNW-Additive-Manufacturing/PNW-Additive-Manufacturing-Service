import { RegularSearchAlt } from "lineicons-react"
import * as React from "react";
import Image from 'next/image'

import * as Flowbite from "flowbite-react";

export function NavbarLink({label, path, icon}: {label: string, path: string, icon: React.JSX.Element}): JSX.Element {
	return <a href={path} className="flex  justify-center items-center bg-gray-100 rounded-md pt-2 pb-2 pr-4 pl-4">
		<span className='inline'>{icon}</span>
		<p className='inline'>{label}</p>
	</a>
}

export function Navbar({children}: {children: any}): JSX.Element {
    return (
        <nav className='bg-white outline-1 outline-black w-full'>
            <div className="wrapper w-full p-8 pt-4 pb-4 flex tracking-wider items-center">
                <Image className="mr-2" src="/logo_transparent.svg" width={80} height={1} alt="PNWAM Logo"></Image>
                <span>
                    <p style={{fontSize: "22px", color: "#A3821E", fontFamily: "Coda"}}>Purdue Northwest</p>
                    <p style={{fontSize: "14px", color: "black", fontFamily: "Coda"}}>Additive Manufacturing</p>
                </span>
                <div className="float-right ml-4 flex items-center justify-center flex-row gap-2">
                    {children}
                </div>
            </div>
        </nav>
    )
}