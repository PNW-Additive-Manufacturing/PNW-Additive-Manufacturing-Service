"use client"

import { Permission } from "@/app/api/util/Constants";
import { RegularChevronDown, RegularMenu, RegularSearchAlt, RegularUser } from "lineicons-react"
import { CSSProperties, DetailedHTMLProps, Fragment, HTMLAttributes, useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import UserIcon from "./icons/UserIcon";
import { usePathname } from "next/navigation";

function NavbarLink({ name, path }: { name: string, path: string }) {
    return <a href={path} className="rounded-md whitespace-nowrap md:rounded-none w-full p-4 md:p-0 bg-gray-100 sm:bg-transparent md:w-fit border-b-4 border-b-pnw-gold-light border-opacity-10 hover:text-pnw-gold active:text-pnw-gold" >{name}</a>
}

export function AccountDetails({ permission, email } : { permission : Permission|null, email : String|null}) {
    const [expanded, setExpanded] = useState<boolean>(false);

    return <div onClick={() => setExpanded(() => !expanded)} className={`bg-gray-100  h-10 ${expanded ? 'rounded-t-md' : 'rounded-md'} hover:cursor-pointer`}>

        <div className="flex flex-row items-center gap-1 px-4">
            <UserIcon className="h-5.5 aspect-square md:hidden" style={{ fill: "rgb(64, 64, 64)" }} />
            {email}
            <div className="ml-auto align-bottom">
                <RegularChevronDown className={`aspect-square h-10 ${expanded ? 'rotate-180' : 'rotate-0'} transition-transform`} />
            </div>
        </div>

        <div
            className={`${expanded ? 'border-t-2 border-solid border-gray-200' : 'hidden'} rounded-b-md bottom-0 w-full h-fit bg-gray-100 flex flex-col gap-4 px-4 py-2`}
            style={{ position: "relative" }}>
            {(() => {
                if (permission == null) {
                    return (<Fragment>
                        <Link href='/user/create-account'>Create</Link>
                        <Link href='/user/login'>Login</Link>
                    </Fragment>);
                } else {
                    return (<Fragment>
                        <Link href="/user/profile">Edit Profile</Link>
                        <Link href='/user/logout'>Logout</Link>
                    </Fragment>);
                }
            })()}
        </div>
    </div>
}

export function ColorfulRequestPrintButton() {
    return <a href="/request-part/"
        className='bg-gradient-linear-pnw-mystic text-center tracking-wider whitespace-nowrap font-semibold uppercase rounded-md bottom-0 h-fit bg-gray-100 flex flex-col gap-4 px-4 py-2'>
        Request Print
    </a>
}

function ScreenDimmer(props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return <div className="absolute top-0 left-0 w-full h-screen bg-black bg-opacity-20" {...props} />
}

export function Navbar({ links, includeIcon, specialElements, style }:
    {
        links: { name: string, path: string }[],
        includeIcon?: boolean,
        specialElements?: JSX.Element,
        style?: CSSProperties
    }): JSX.Element {
    includeIcon = includeIcon ?? true;

    let [itemsExpanded, setExpanded] = useState<boolean>(false);

    const currentPath = usePathname();
    let currentPathSegments = currentPath.split("/");
    currentPathSegments = currentPathSegments.slice(1, currentPathSegments.length - 1);

    return <div className="top-0 sticky">
        <div className="w-full h-nav px-4 bg-white">
            <nav className='flex flex-row h-full overflow-x-clip w-full items-center align-middle mb-8'
                style={Object.assign({ boxShadow: "0px 3px 10px 0px rgba(232, 232, 232, 0.1)" }, style ?? {})}>

                <Link href="/" className=" flex-none gap-2 items-center mr-2">
                    <Image className="h-full" src="/assets/logo.svg" width={60} height={100} alt="PNW AM Logo" />
                </Link>
                <div className="hidden lg:block w-fit whitespace-nowrap mr-fit pr-3 text-xl tracking-wide flex-fit" style={{ maxWidth: 'max(0px, calc((100% - 120px)*999))' }}>
                    <span className="text-pnw-gold" style={{ fontFamily: "Coda" }}>PNW </span>
                    <span>Additive Manufacturing</span>
                </div>

                <div className="hidden xl:block whitespace-nowrap px-5 py-3 place-self-center text-sm font-light">
                    <a className="capitalize" href='/'>Home</a>
                    {currentPathSegments.map((segment, index, arr) => {
                        const segments = arr.slice(0, index + 1);
                        const fullPath = `/${segments.join('/')}`;
                        const pathname = segment;
                        return <a key={pathname} className="capitalize" href={fullPath}>{` / ${pathname}`}</a>;
                    })}
                </div>

                {/* Long List of links and dropdown */}
                <div className="hidden md:flex ml-auto items-center justify-end tracking-wider gap-5">
                    {links.map(val => <NavbarLink key={val.name} name={val.name} path={val.path} />)}
                    <div className="flex gap-2">{specialElements == null ? <></> : specialElements}</div>
                </div>

                {/* Small dropdown for mobile screens */}
                <RegularMenu className="md:hidden text-right ml-auto h-full w-auto p-2" onClick={() => setExpanded(() => !itemsExpanded)} />
                <div>
                    {itemsExpanded ? <>
                        <ScreenDimmer />
                        <div className={`absolute right-0 top-0 h-screen w-4/5 sm:w-1/3 md:hidden`} style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
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
        </div>
        <div className="xl:hidden bg-gray-100">
            <div className="px-5 py-3 text-sm font-light">
                <a className="capitalize" href='/'>Home</a>
                {currentPathSegments.map((segment, index, arr) => {
                    const segments = arr.slice(0, index + 1);
                    const fullPath = `/${segments.join('/')}`;
                    const pathname = segment;
                    return <a key={pathname} className="capitalize" href={fullPath}>{` / ${pathname}`}</a>;
                })}
            </div>
        </div>
    </div>
}