"use server"

import { redirect } from "next/navigation";

export default async function Maintainer() 
{
    redirect('/dashboard/maintainer');
}
