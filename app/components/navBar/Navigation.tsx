import { AccountPermission } from "@/app/Types/Account/Account";
import HorizontalWrap from "../HorizontalWrap";
import { NavbarDesktop } from "./NavbarDesktop";

interface NavigationProps {
    unauthorizedPages: { name: string; path: string; }[];
    authorizedPages: { name: string; path: string; permission: AccountPermission }[];
}

export default function Navigation({ unauthorizedPages, authorizedPages} : NavigationProps) : React.ReactElement {

    return (
        <div className="top-0 sticky shadow-md z-10">
            <div className="w-full h-fit bg-white py-3">
                <HorizontalWrap>
                    <nav
                        className="h-full max-xl:flex overflow-x-clip w-full items-center align-middle">

                        <NavbarDesktop
                            unauthorizedPages={unauthorizedPages}
                            authorizedPages={authorizedPages}/>

                        {/* <NavbarMobile
                            unauthorizedPages={unauthorizedPages}
                            authorizedPages={authorizedPages}/> */}

                    </nav>
                </HorizontalWrap>
            </div>
        </div>
    );
}
