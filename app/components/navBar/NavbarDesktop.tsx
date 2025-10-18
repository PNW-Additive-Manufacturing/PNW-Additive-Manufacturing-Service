

import Image from "next/image";
import Link from "next/link";
import { amImageIconLightCropped } from "../../Branding";
import NavbarLink from "./NavbarLink";

interface NavbarDesktopProps {
    links: {
        name: string;
        path: string;
    }[];
    includeIcon?: boolean;
    specialElements?: JSX.Element;
}

export function NavbarDesktop({ links, includeIcon, specialElements }: NavbarDesktopProps) {
    return (
        <div className="hidden xl:flex justify-between items-center align-middle gap-8">
            <div className="hidden xl:flex items-center justify-end tracking-wider gap-4 overflow-x-hidden">
                {includeIcon && (
                    <Link href="/">
                        <Image
                            loading={"eager"}
                            className="w-10"
                            src={amImageIconLightCropped}
                            alt={""}
                            priority={true}
                        />
                    </Link>
                )}
                {links.map((val) => (
                    <NavbarLink key={val.name} name={val.name} path={val.path} />
                ))}
            </div>
            <div className="flex gap-2">
                {specialElements == null ? <div></div> : specialElements}
            </div>
        </div>
    );
}