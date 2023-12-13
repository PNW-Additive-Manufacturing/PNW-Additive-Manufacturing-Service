"use server"

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import db from "@/app/api/Database";
import Link from "next/link";
import { RegularCart, RegularLicense } from "lineicons-react";
import GenericPrinterIcon from "@/app/components/icons/GenericPrinterIcon";
import FilamentSpoolIcon from "@/app/components/icons/FilamentSpoolIcon";


export default async function Maintainer() 
{
    let jwtPayload = await getJwtPayload();

    const userCount = (await db`select COUNT(*) from account`)[0] as {count: number};

    return <>
        <div className="text-3xl mb-10">Welcome, {jwtPayload?.firstname} {jwtPayload?.lastname}!</div>

        <a href="/dashboard/admin/users" className="w-full sm:max-w-sm block"><button className="flex items-center w-full text-base font-normal">
            <RegularLicense className="inline-block w-10 h-10 mr-auto fill-gray-300"></RegularLicense>
            <span>Manage {userCount.count} Accounts</span>
        </button></a>
        <a href="/dashboard/admin/printers" className="w-full sm:max-w-sm block"><button className="flex items-center w-full text-base font-normal">
            <GenericPrinterIcon className="inline-block h-10 mr-auto fill-gray-300"></GenericPrinterIcon>
            <span>Manage Printers</span>   
        </button></a>
    </>
}
