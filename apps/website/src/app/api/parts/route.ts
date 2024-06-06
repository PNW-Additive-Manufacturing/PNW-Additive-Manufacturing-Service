import { NextRequest, NextResponse } from "next/server";
import { getParts } from "../util/GetParts";

export async function GET(request: NextRequest) 
{
    //no need to check JWT because that is checked by middleware
    let orderId = request.nextUrl.searchParams.get("order");

    if (!orderId) return NextResponse.json({ error: "No OrderID provided!" });
    // if (!Number.isInteger(orderId)) return NextResponse.json({error: "OrderID is not a number!"})

    let parts = await getParts(Number.parseInt(orderId));

    return NextResponse.json(parts);
}