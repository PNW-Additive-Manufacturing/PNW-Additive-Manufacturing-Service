'use server'

import { redirect } from "next/navigation";

export default async function Maintainer() 
{
    // TODO: Redirect to permission level dashboard!
    redirect('/dashboard/user');
}