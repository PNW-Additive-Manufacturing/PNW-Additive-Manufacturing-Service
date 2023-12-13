"use server"

import { Permission } from "@/app/api/util/Constants";
import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { RegularCart, RegularLicense } from "lineicons-react";
import Link from "next/link";
import db from "@/app/api/Database";
import GenericPrinterIcon from "@/app/components/icons/GenericPrinterIcon";
import FilamentSpoolIcon from "@/app/components/icons/FilamentSpoolIcon";

export default async function Maintainer() 
{
	let jwtPayload = await getJwtPayload();

    const orderCount = (await db`select COUNT(*) from request where isfulfilled=false`)[0] as {count: number};

    return <>
        <div className="text-3xl mb-10">Welcome, {jwtPayload?.firstname} {jwtPayload?.lastname}!</div>

        <a href="/dashboard/maintainer/orders" className="sm:max-w-sm block"><button className="flex items-center w-full text-base font-normal">
            <RegularCart className="inline-block w-12 h-12 mr-auto fill-gray-300"></RegularCart>
            <span>View {orderCount.count} Orders</span>
        </button></a>
        {/* <a href="/dashboard/maintainer/printers" className="w-96 block"><button className="flex items-center text-lg font-normal">
            <GenericPrinterIcon className="inline-block w-12 h-12 mr-auto fill-gray-100"></GenericPrinterIcon>
            <span>Control Printers</span>   
        </button></a> */}
        <a href="/dashboard/maintainer/filaments" className="sm:max-w-sm block"><button className="flex items-center w-full text-base font-normal">
            <FilamentSpoolIcon className="inline-block w-12 h-12 mr-auto fill-gray-300"></FilamentSpoolIcon>
            <span>Manage Filament</span>
        </button></a>
    </>
}
