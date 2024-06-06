import { NextRequest, NextResponse } from "next/server";
import postgres from 'postgres';
import db from '@/app/api/Database'
import { assert } from "console";

export async function GET(request: NextRequest) {

    let code = request.nextUrl.searchParams.get("code");
    if (code == null)
    {
        return NextResponse.json({error: "Code not provided"});
    }

    try
    {
        var result = await db`select COUNT(*) from account where verificationid=${code}`;
    }
    catch(e)
    {
        console.error(e);
        return NextResponse.json({error: "Failed to access database"});
    }
    if (result.count == 0)
    {
        return NextResponse.json({error: "Code is not valid"});
    }

    assert(result.count > 1, "Multiple accounts have matching verification IDs!");

    try
    {
        await db`UPDATE account SET verificationid=null WHERE verificationid=${code}`;
    }
    catch(e)
    {
        return NextResponse.json({error: "Failed to update database"});
    }
    return NextResponse.redirect("/");

}