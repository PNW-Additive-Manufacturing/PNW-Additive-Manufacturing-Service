import { NextRequest, NextResponse } from "next/server";
import { fetchMachines } from "../farmServ";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const machines = await fetchMachines();

	return machines == null
		? new NextResponse(
				JSON.stringify({
					success: false,
					message: "Unable to contact the FarmAPI!"
				}),
				{ status: 500 }
		  )
		: NextResponse.json({
				success: true,
				...machines
		  });
}
