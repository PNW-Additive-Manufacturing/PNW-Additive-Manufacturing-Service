import { NextRequest, NextResponse } from "next/server";
import { resError, resOk, resOkData } from "../APIResponse";
import { attemptLogin } from "../util/AccountHelper";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
export async function POST(request: NextRequest): Promise<NextResponse> {

    if (request.method != "POST") return new NextResponse(null, { status: 405 });

    const schema = loginSchema.safeParse(await request.json());
    if (!schema.success) return NextResponse.json(resError(schema.error.toString()));
    
    try
    {
        const token = await attemptLogin(schema.data!.email, schema.data!.password);

        return NextResponse.json(resOkData({ token }));
    }
    catch (error)
    {
        return NextResponse.json(resError("Incorrect email or password!"));
    }
}
