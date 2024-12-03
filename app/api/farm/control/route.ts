import { NextRequest, NextResponse } from "next/server";
import { controlMachine, fetchMachines } from "../farmServ";
import { z } from "zod";
import { act } from "react";
import { resError, resOk } from "../../APIResponse";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const identifier = request.nextUrl.searchParams.get("identifier") as string;
    const action = request.nextUrl.searchParams.get("action") as string;

	try
    {
        await controlMachine(identifier, action as any);

        return NextResponse.json(resOk());
    }
    catch(ex)
    {
        return NextResponse.json(resError(ex as string));
    }
}
