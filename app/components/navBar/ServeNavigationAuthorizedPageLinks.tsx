import { GetAccountPermissionLevel } from "@/app/Types/Account/Account";
import { serveSession } from "@/app/utils/SessionUtils";
import NavbarLink from "./NavbarLink";
import Navigation from "./Navigation";

export default async function ServeNavigationAuthorizedPageLinks({ authorizedPages }: { authorizedPages: React.ComponentProps<typeof Navigation>["authorizedPages"] })
{
    const session = await serveSession();

    const accountPermissionLevel = session.isSignedIn ? GetAccountPermissionLevel(session.account.permission) : GetAccountPermissionLevel(null);

    return <>

        { authorizedPages
            .filter(p => accountPermissionLevel >= GetAccountPermissionLevel(p.permission))
            .map(p => <NavbarLink key={p.path} name={p.name} path={p.path} />) }
    
    </>

}