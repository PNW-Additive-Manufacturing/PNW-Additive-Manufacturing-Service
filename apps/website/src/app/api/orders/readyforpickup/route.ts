import { NextRequest, NextResponse } from "next/server";
import { getOrdersReadyForPickup } from "../../util/GetRequests";

export async function GET(request: NextRequest) 
{
    //no need to check JWT because that is checked by middleware

    let orders: Request[] = await getOrdersReadyForPickup() as Request[];
    
    return NextResponse.json(orders);
}