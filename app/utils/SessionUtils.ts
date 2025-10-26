import { redirect } from "next/navigation";
import { cache } from "react";
import { reqJWT } from "../api/util/JwtHelper";
import Account, { AccountPermission, GetAccountPermissionLevel } from "../Types/Account/Account";
import AccountServe from "../Types/Account/AccountServe";
import { queryInCompleteReregistration } from "../Types/RegistrationSpan/RegistrationSpanServe";
import { reqCurrentPath } from "./NavigationUtils";

type ServeSessionOptions = Partial<{ requiredPermission: AccountPermission, unauthorizedBehavior: "redirect" | "logged-out" }>

export type SessionSignedIn = { isSignedIn: true, account: Account };
export type SessionLoggedOut = { isSignedIn: false };

async function __serveSession(options: ServeSessionOptions)
{
    // You cannot wrap redirects in try...catch because internally next throws an exception to stop execution when invoking redirect.

    const reqSession = await reqJWT();

    if (reqSession == undefined) return { isSignedIn: false } as SessionLoggedOut;

    // Used to route back to the current path once any login operation is complete.
    const currentPath = await reqCurrentPath();

    // Read session
    const dbSession = await AccountServe.queryByEmail(reqSession.email);

    if (dbSession == undefined) {
        // An account of the reqSession does not exist in our database!
        // (await cookies()).delete(appConfig.sessionCookie);

        console.log("Account doesn't exist!");

        // We are unable to modify cookies so redirect browser to a route which will perform the removal.
        redirect("/user/logout");
    }

    console.log(currentPath);
    
    if (dbSession.isBanned && !currentPath.startsWith("/user/banned"))
    {
        redirect("/user/banned");
    }

    if (!dbSession.isEmailVerified && !currentPath.startsWith("/user/not-verified"))
    {
        redirect("/user/not-verified");
    }

    // // Compare dbSession and reqSession to apply any potential session updates.
    // const difference = compareObjectFields(reqSession, dbSession);

    // if (!objectFieldsIsUndefined(difference)) {
    //     // Account details have changed! Update client session.

    //     console.log("Difference in session!", difference);
    // }

    // Check if a registration is pending.
    const reregistration = await queryInCompleteReregistration(new Date(), reqSession.email);

    if (reregistration !== null && !currentPath.startsWith("/user/reregistration")) {

        console.log("Redirect to reregistration");

        redirect(`/user/reregistration/${reregistration.id}`);
    }

    // Go over options

    if (options.requiredPermission !== undefined) {
        const requiredPermissionLevel = GetAccountPermissionLevel(options.requiredPermission);

        if (requiredPermissionLevel > GetAccountPermissionLevel(dbSession.permission)) {
            
            // Account does not have the required permission
            if (options.unauthorizedBehavior === "redirect")
            {
                redirect("/");
            }
            else if (options.unauthorizedBehavior === "logged-out")
            {
                return { isSignedIn: false } as SessionLoggedOut;
            }

        }
    }

    return { isSignedIn: true, account: dbSession } as SessionSignedIn;
}

// https://nextjs.org/docs/app/guides/caching#react-cache-function
// fetch requests using the GET or HEAD methods are automatically memoized, so you do not need to wrap it in React cache. 
// However, for other fetch methods, or when using data fetching libraries (such as some database, CMS, or GraphQL clients) 
// that don't inherently memoize requests, you can use cache to manually memoize data requests.
// const cachedCheckSession = cache(async (options: ServeSessionOptions) => await checkSession(options));
const cachedServeSession = cache(async (options: ServeSessionOptions) => await __serveSession(options));

export async function serveSession(options?: ServeSessionOptions): Promise<SessionSignedIn | SessionLoggedOut> {

    if (options === undefined) options = { unauthorizedBehavior: "redirect" };

    return await cachedServeSession(options);
}

/**
 * Redirects to login page if not signed in.
 */
export async function serveRequiredSession(options?: ServeSessionOptions): Promise<SessionSignedIn> {
    const session = await serveSession(options);

    if (session.isSignedIn) return session;

    const currentPath = await reqCurrentPath();

    return redirect(`/user/login?redirect=${encodeURIComponent(currentPath)}&reason=${encodeURIComponent("Authorization Required")}`);
}