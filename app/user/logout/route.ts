import getConfig from "@/app/getConfig";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const appConfig = getConfig();

export async function GET()
{
    (await cookies()).delete(appConfig.sessionCookie);
    revalidateTag("account", "max");
    redirect("/user/login");
} 