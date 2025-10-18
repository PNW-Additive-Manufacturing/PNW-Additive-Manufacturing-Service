import {CSSProperties} from "react";
import HorizontalWrap from "../HorizontalWrap";
import {NavbarDesktop} from "./NavbarDesktop";
import {NavbarMobile} from "./NavbarMobile";

export interface NavbarProps {
    links : {
        name: string;
        path: string;
    }[];
    includeIcon?: boolean;
    specialElements?: JSX.Element;
    style?: CSSProperties;
}

export function Navbar({links, includeIcon, specialElements} : NavbarProps) : JSX.Element {
    includeIcon = includeIcon ?? true;

    return (
        <div className="top-0 sticky shadow-md z-10">
            <div className="w-full h-fit bg-white py-3">
                <HorizontalWrap>
                    <nav
                        className="h-full max-xl:flex overflow-x-clip w-full items-center align-middle">
                        <NavbarDesktop
                            links={links}
                            includeIcon={includeIcon}
                            specialElements={specialElements}/>
                        <NavbarMobile
                            links={links}
                            includeIcon={includeIcon}
                            specialElements={specialElements}/>
                    </nav>
                </HorizontalWrap>
            </div>
        </div>
    );
}
