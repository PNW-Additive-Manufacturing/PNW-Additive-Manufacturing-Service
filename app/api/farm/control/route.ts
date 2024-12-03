import { NextRequest, NextResponse } from "next/server";
import { controlMachine, fetchMachines, printOnMachine } from "../farmServ";
import { z } from "zod";
import { act } from "react";
import { resError, resOk } from "../../APIResponse";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const identifier = request.nextUrl.searchParams.get("identifier") as string;
    const action = request.nextUrl.searchParams.get("action") as string;

    if (action == "start")
    {
        const fileToPrint = request.nextUrl.searchParams.get("fileToPrint") as string;
        if (fileToPrint == undefined)
        {
            return NextResponse.json(resError("fileToUse must be provided!"));
        }

        return NextResponse.json(await printOnMachine(identifier, fileToPrint));
    }

	return NextResponse.json(await controlMachine(identifier, action as any));
}
