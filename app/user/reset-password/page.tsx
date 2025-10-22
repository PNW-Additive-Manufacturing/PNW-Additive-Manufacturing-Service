"use server";

import getConfig from "@/app/getConfig";
import { redirect } from "next/navigation";
import { z } from "zod";
import db from "@/app/api/Database";
import { addMinutes } from "@/app/utils/TimeUtils";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import ErrorPrompt from "@/app/components/ErrorPrompt";
import ResetPassword from "./resetPassword";

const appConfig = getConfig();

export default async function Page(
    props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const searchParams = await props.searchParams;
    const resetCode = searchParams ? z.string().safeParse(searchParams["code"]).data : null;
    if (resetCode == null) redirect(`${appConfig.hostURL}/not-found`);

    const query = (await db`SELECT * FROM AccountPasswordResetCode WHERE Code=${resetCode}`).at(0);
    if (query == null || new Date() > addMinutes(query.createdat as Date, appConfig.accountPasswordResetExpiration)) {
        return <ErrorPrompt code="Expired" details="This password reset link has expired. Please request a new one to reset your password."></ErrorPrompt>
    }

    return <HorizontalWrap className="py-8">
        <ResetPassword resetCode={resetCode} />
    </HorizontalWrap>
}