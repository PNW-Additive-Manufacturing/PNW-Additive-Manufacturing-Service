"use client"

import { RegularChevronDown, RegularMenu, RegularSearchAlt, RegularUser } from "lineicons-react"
import { CSSProperties, DetailedHTMLProps, HTMLAttributes, useState } from "react";
import Image from 'next/image'
import { getJwtPayload } from "../api/util/JwtHelper";
import Link from "next/link";
import UserIcon from "./icons/UserIcon";

function NavbarLink({ name, path }: { name: string, path: string }) {
    return <a href={path} className="rounded-md whitespace-nowrap md:rounded-none w-full p-4 md:p-0 bg-gray-100 sm:bg-transparent md:w-fit border-b-4 border-b-pnw-gold-light border-opacity-10 hover:text-pnw-gold active:text-pnw-gold" >{name}</a>
}

export function AccountDetails() {
    const [expanded, setExpanded] = useState<boolean>(false);

    return <div className={`bg-gray-100  h-10 ${expanded ? 'rounded-t-md' : 'rounded-md'}`}>
        <div className="flex flex-row items-center gap-1 px-4">
            <UserIcon className="h-5.5 aspect-square md:hidden" style={{ fill: "rgb(64, 64, 64)" }} />
            Account
            <div className="ml-auto align-bottom">
                <RegularChevronDown
                    className={`aspect-square h-10 ${expanded ? 'rotate-180' : 'rotate-0'} transition-transform hover:cursor-pointer`}
                    onClick={() => setExpanded(() => !expanded)} />
            </div>
        </div>
        {/* TODO: Add more options when dropping down */}
        <div
            className={`${expanded ? 'border-t-2 border-solid border-gray-200' : 'hidden'} rounded-b-md bottom-0 w-full h-fit bg-gray-100 flex flex-col gap-4 px-4 py-2`}
            style={{ position: "relative" }}>
            <Link href='/user/login'>Login</Link>
            <Link href='/user/logout'>Logout</Link>
        </div>
    </div>
}

export function ColorfulRequestPrintButton() {
    return <Link href="/request-part/"
        className='bg-gradient-linear-pnw-mystic text-center tracking-wider font-semibold uppercase rounded-md bottom-0 h-fit bg-gray-100 flex flex-col gap-4 px-4 py-2'>
        Request Print
    </Link>
}

function ScreenDimmer(props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return <div className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-20" {...props} />
}

export function Navbar({ links, includeIcon, specialElements, style }:
    {
        links: { name: string, path: string }[],
        includeIcon?: boolean,
        specialElements?: JSX.Element,
        style?: CSSProperties
    }): JSX.Element {
    includeIcon = includeIcon ?? true;

    const [itemsExpanded, setExpanded] = useState<boolean>(false);

    return <nav className='flex flex-row px-5 py-3 h-nav items-center align-middle bg-white w-screen sticky mb-8' style={Object.assign({ boxShadow: "0px 3px 10px 0px rgba(232, 232, 232, 0.1)"}, style ?? {})}>
        <Link href="/" className="flex gap-2 items-center w-fit mr-2">
            <Image className="h-full" src="/assets/logo.svg" width={60} height={100} alt="PNW AM Logo" />
        </Link>
        <div className="w-fit whitespace-nowrap text-xl hidden md:block tracking-wide flex-auto">
            <span className="text-pnw-gold" style={{ fontFamily: "Coda" }}>PNW </span>
            <span>Additive Manufacturing</span>
            {/* <span className="hidden inline sm:inline" style={{color: "var(--pnw-black)", fontFamily: "Coda" }}>Additive Manufacturing</span> */}
        </div>

        <div className="hidden md:flex items-center justify-end tracking-wider gap-5">
            {links.map(val => <NavbarLink key={val.name} name={val.name} path={val.path} />)}

            <div className="flex gap-2">{specialElements == null ? <></> : specialElements}</div>
        </div>

        <RegularMenu className="md:hidden text-right ml-auto h-full w-auto p-2" onClick={() => setExpanded(() => !itemsExpanded)} />
        <div>
            {itemsExpanded ? <>
                <ScreenDimmer />
                <div
                    className={`absolute right-0 top-0 h-screen w-4/5 sm:w-1/3 md:hidden`}
                    style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}
                >
                    <div className="h-nav w-full pl-5 pr-5 py-3 bg-cool-black ">
                        <RegularMenu onClick={() => setExpanded(() => !itemsExpanded)} className="fill-white float-right text-right h-full w-auto p-2"></RegularMenu>
                    </div>
                    <div className="flex flex-col gap-2 bg-root h-remaining-screen-with-nav p-2" style={{ backgroundColor: "rgb(248, 248, 248)" }}>
                        {links.map(val => <NavbarLink key={val.name} name={val.name} path={val.path} />)}
                        {specialElements == null ? <></> : specialElements}
                    </div>
                </div>
            </> : <></>}
        </div>
    </nav>
}