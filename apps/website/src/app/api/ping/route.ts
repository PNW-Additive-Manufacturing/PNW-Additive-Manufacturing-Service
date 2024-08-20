"use server";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	return new NextResponse("OK", { status: 200 });
}
