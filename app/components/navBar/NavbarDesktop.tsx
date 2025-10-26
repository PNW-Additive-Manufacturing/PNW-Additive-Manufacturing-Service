

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { amImageIconLightCropped } from "../../Branding";
import NavbarLink from "./NavbarLink";
import Navigation from "./Navigation";
import { ServeAccountDetails } from "./ServeAccountDetails";
import ServeNavigationAuthorizedPageLinks from "./ServeNavigationAuthorizedPageLinks";

export function NavbarDesktop({ unauthorizedPages, authorizedPages }: React.ComponentProps<typeof Navigation>) {

    return <>

        <div className="hidden xl:flex justify-between">

            <div className="hidden xl:flex items-center tracking-wider gap-4 overflow-x-hidden">

                <Link href="/">
                    <Image className="w-10" src={amImageIconLightCropped} alt={""} priority={true} />
                </Link>

                {unauthorizedPages.map(p => <NavbarLink key={p.path} name={p.name} path={p.path} />)}

                {/* Stream in Authorized Pages */}
                <Suspense>

                    <ServeNavigationAuthorizedPageLinks authorizedPages={authorizedPages} />

                </Suspense>

            </div>


            {/* Items to the Right */}
            <Suspense>
                
                <ServeAccountDetails />

            </Suspense>


        </div>

    </>
}