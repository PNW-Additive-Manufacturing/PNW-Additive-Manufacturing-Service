"use server";

import AccountServe from "@/app/Types/Account/AccountServe";
import { queryInCompleteReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { resOkData } from "@/app/api/APIResponse";
import { login } from "@/app/api/util/AccountHelper";
import { reqJWT } from "@/app/api/util/JwtHelper";
import getConfig from "@/app/getConfig";
import { NextRequest, NextResponse } from "next/server";

const envConfig = getConfig();

export async function GET(request: NextRequest) 
{
    const currentJWT = await reqJWT();
    if (currentJWT === null)
    {
        return new NextResponse(null, {status: 401});
    }

    // Query new information!
    const accountDetails = await AccountServe.queryByEmail(currentJWT.email);
    if (accountDetails == null)
    {
        // Account does not exist? Remove session cookie!
        return new NextResponse(null, {status: 401});
    }

    const reregistration = await queryInCompleteReregistration(new Date(), currentJWT.email);

    // Spot the differences between the JWT and the actual account!
    const isEmailVerificationChanged = currentJWT?.isEmailVerified != accountDetails?.isEmailVerified;
    const isPermissionChanged = currentJWT.permission != accountDetails?.permission;
    const isBannedChanged = currentJWT.isBanned != accountDetails.isBanned;

    const res = NextResponse.json(resOkData({
        account: accountDetails,
        reregistration: reregistration?.id
    }));

    if (isEmailVerificationChanged || isPermissionChanged || isBannedChanged)
    {
        const token = await login(accountDetails);
        res.cookies.set(envConfig.sessionCookie, token);
    }
    return res;
}
