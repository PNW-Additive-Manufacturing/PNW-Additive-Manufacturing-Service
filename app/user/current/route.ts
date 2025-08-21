"use server";

import AccountServe from "@/app/Types/Account/AccountServe";
import { getJwtPayload, retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import db from "@/app/api/Database";
import { NextRequest, NextResponse } from "next/server";
import { IsVerificationCodeExpired } from "@/app/Types/Account/Account";
import { login } from "@/app/api/util/AccountHelper";
import getConfig from "@/app/getConfig";
import { cookies } from "next/headers";
import { env } from "process";
import { resOkData } from "@/app/api/APIResponse";
import { queryInCompleteReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";

const envConfig = getConfig();

export async function GET(request: NextRequest) 
{
    const currentJWT = await retrieveSafeJWTPayload();
    if (currentJWT == null)
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
    const isEmailVerificationChanged = currentJWT?.isemailverified != accountDetails?.isEmailVerified;
    const isPermissionChanged = currentJWT.permission != accountDetails?.permission;
    const isBannedChanged = currentJWT.isBanned != accountDetails.isBanned;
            
    const res = NextResponse.json(resOkData({
        account: accountDetails,
        reregistration: reregistration?.id
    }));

    if (isEmailVerificationChanged || isPermissionChanged || isBannedChanged)
    {
        const token = await login(accountDetails.email, accountDetails.permission, accountDetails.firstName, accountDetails.lastName, accountDetails.isEmailVerified, accountDetails.isBanned);
        res.cookies.set(envConfig.sessionCookie, token);
    }
    return res;
}
