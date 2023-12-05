import { RegularSearchAlt } from "lineicons-react"
import * as React from "react";
import Image from 'next/image'
import HorizontalWrap from "./HorizontalWrap";

/*
export function NavbarLink({label, path, icon}: {label: string, path: string, icon: React.JSX.Element}): JSX.Element {
	return <a href={path} className="flex  justify-center items-center bg-gray-100 rounded-md pt-2 pb-2 pr-4 pl-4">
		<span className='inline'>{icon}</span>
		<p className='inline'>{label}</p>
	</a>
}
*/
function NavbarLink({name, path} : {name: string, path: string}) {
    return <a href={path} className="hover:text-pnw-gold" >{name}</a>
}

export function Navbar({links}: {links: {name: string, path: string}[]}): JSX.Element {
    return (
        <nav className='bg-pnw-gold-light flex flex-row p-3 justify-between outline-1 outline-black w-full '>
            <div className="basis-1/3 flex tracking-wider ">
                <a href="/">
                    <Image className="mr-2 pt-1" src="/assets/PNW_Logo_Small.png" width={100} height={20} alt="PNWAM Logo"></Image>
                </a>
                <span>
                    <p style={{fontSize: "20px", color: "var(--pnw-gold)", fontFamily: "Coda"}}>Purdue Northwest</p>
                    <p style={{fontSize: "12px", color: "var(--pnw-black)", fontFamily: "Coda"}}>Additive Manufacturing</p>
                </span>
            </div>
            <div className="w-full flex basis-2/3 items-center justify-end tracking-wider gap-5">
                {links.map(val => <NavbarLink key={val.name} name={val.name} path={val.path}/>)}
            </div>
        </nav>
    )
}