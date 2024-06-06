import { NextRequest, NextResponse } from "next/server";
import { getAllRequests, getFulfilledOrders, getOrdersWithPartWithStatus, getStatusRequests } from "../util/GetRequests";

export async function GET(request: NextRequest) 
{
    //no need to check JWT because that is checked by middleware

    let orders: Request[] = [];

    const onlyWithPartStatus = request.nextUrl.searchParams.get("onlyWithPartStatus");
    const onlyFulfilled = request.nextUrl.searchParams.get("fulfilled") != null;

    if (onlyFulfilled)
    {
        orders = await getFulfilledOrders() as Request[];
    }
    else if (onlyWithPartStatus)
    {
        orders = await getOrdersWithPartWithStatus(onlyWithPartStatus) as Request[];
    }
    else
    {
        orders = await getAllRequests() as Request[];
    }
    
    return NextResponse.json(orders);
}