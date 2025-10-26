import getConfig from "@/app/getConfig";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const appConfig = getConfig();

export async function GET()
{
    (await cookies()).delete(appConfig.sessionCookie);
    redirect("/user/login");
} 