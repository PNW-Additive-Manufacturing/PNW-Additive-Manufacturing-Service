"use client"

import { RegularChevronDown, RegularSearchAlt, RegularUser } from "lineicons-react"
import { useState } from "react";
import Image from 'next/image'
import HorizontalWrap from "./HorizontalWrap";
import { getJwtPayload } from "../api/util/JwtHelper";
import SvgChevronDown from "lineicons-react/dist/types/svgs/regular/Direction/RegularChevronDown";
import Link from "next/link";

function NavbarLink({ name, path }: { name: string, path: string }) {
    return <a href={path} className="border-b-4 border-b-pnw-gold-light border-opacity-10 hover:text-pnw-gold" >{name}</a>
}

export function AccountDetails() {
    const [expanded, setExpanded] = useState<boolean>(false);

    return <div className={`bg-gray-100 h-10 ${expanded ? 'rounded-t-md' : 'rounded-md'}`}>
        <div className="flex items-center gap-2 px-4">
            Account
            <RegularChevronDown
                className={`aspect-square h-10 ${expanded ? 'rotate-180' : 'rotate-0'} transition-transform hover:cursor-pointer`}
                onClick={() => setExpanded(!expanded)} />
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
        className='bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md bottom-0 h-fit bg-gray-100 flex flex-col gap-4 px-4 py-2'>
        Print
    </Link>
}

export function Navbar({ links, includeIcon, specialElements }:
    {
        links: { name: string, path: string }[],
        includeIcon?: boolean,
        specialElements?: JSX.Element
    }): JSX.Element {
    includeIcon = includeIcon ?? true;

    return (
        <nav className='flex flex-row px-5 py-3 h-nav justify-between bg-white w-screen sticky' style={{ boxShadow: "0px 3px 10px 0px rgba(232, 232, 232, 0.1)" }}>
            <div className="basis-1/3 flex tracking-wider">
                <a href="/" className="flex gap-2 justify-center items-center">
                    {includeIcon
                        ? <Image className="p-0 " src="/assets/logo.svg" width={60} height={100} alt="PNW AM Logo" /> : <></>}
                    <span className="">
                        <span className="hidden md:inline text-pnw-gold font-bold mr-1.5" style={{ fontSize: "20px", fontFamily: "Coda" }}>PNW</span>
                        <span className="hidden sm:inline" style={{ fontSize: "20px", color: "var(--pnw-black)", fontFamily: "Coda" }}>Additive Manufacturing</span>
                    </span>
                </a>
            </div>
            <div className="w-full flex basis-2/3 items-center justify-end tracking-wider gap-5">
                {links.map(val => <NavbarLink key={val.name} name={val.name} path={val.path} />)}

                <div className="flex gap-2">{specialElements == null ? <></> : specialElements}</div>
            </div>
        </nav>
    )
}