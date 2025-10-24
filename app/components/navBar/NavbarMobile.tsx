"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { amImageIconLightCropped } from "../../Branding";
import NavbarLink from "./NavbarLink";
import { ScreenDimmer } from "./ScreenDimmer";

interface NavbarMobileProps {
    links: {
        name: string;
        path: string;
    }[];
    includeIcon?: boolean;
    specialElements?: JSX.Element;
}

export function NavbarMobile({ links, includeIcon, specialElements }: NavbarMobileProps) {
    let [itemsExpanded, setExpanded] = useState<boolean>(false);

    return (
        <>
            {includeIcon && (
                <Link href="/" className="mr-2 xl:hidden">
                    <div className="w-10">
                        <Image src={amImageIconLightCropped} alt={""} priority={true} />
                    </div>
                </Link>
            )}

            <FontAwesomeIcon
				icon={faBars}
                className="xl:hidden text-right ml-auto h-full w-auto p-2"
                onClick={() => setExpanded(() => !itemsExpanded)}
            />
            <div>
                {itemsExpanded ? (
                    <div>
                        <ScreenDimmer onClick={() => setExpanded(false)} />
                        <div
                            className={`absolute right-0 top-0 h-screen w-2/3 xl:hidden`}
                            style={{
                                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                            }}>
                            <div className="h-fit w-full pl-5 pr-5 py-3 bg-cool-black flex justify-between">
                                <div className="w-fit whitespace-nowrap mr-fit pr-3 text-xl tracking-wide flex-fit text-white">
                                    <span>Menu</span>
                                </div>
                                <FontAwesomeIcon
									icon={faBars}
                                    onClick={() => setExpanded(() => !itemsExpanded)}
                                    className="fill-pnw-gold float-right text-right h-full w-auto p-2"
                                />
                            </div>
                            <div
                                className="flex flex-col gap-2 bg-root h-remaining-screen-with-nav p-2 w-full"
                                style={{
                                    backgroundColor: "rgb(248, 248, 248)",
                                }}>
                                {links.map((val) => (
                                    <NavbarLink
                                        onClick={() => setExpanded(false)}
                                        key={val.name}
                                        name={val.name}
                                        path={val.path}
                                    />
                                ))}
                                {specialElements == null ? <div></div> : specialElements}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
        </>
    );
}
