import { serveSession } from "@/app/utils/SessionUtils";
import { cacheTag } from "next/cache";
import Link from "next/link";

export async function ServeAccountDetails() {
    "use cache: private"
    cacheTag("account");

    const session = await serveSession();

    if (session.isSignedIn) {
        return <>

            <Link href={"/user/profile"}>

                <div className="bg-gray-100 flex gap-2 flex-nowrap px-3 items-center justify-center text-nowrap rounded-md button h-full">

                    <span>${session.account.balanceInDollars.toFixed(2)}</span>
                    <span>{session.account.firstName} {session.account.lastName}</span>

                    {/* <FontAwesomeIcon icon={faChevronRight} className="h-3 mt-0.5" /> */}

                </div>

            </Link>

        </>
    }
    else {
        return <>

            <Link href="/user/login">

                <div className="bg-gray-100 flex gap-2 flex-nowrap px-3 items-center justify-center text-nowrap rounded-md button h-full">

                    Login into AMS

                    {/* <FontAwesomeIcon icon={faArrowRight} className="inline" /> */}

                </div>

            </Link>

        </>
    }

    // return session.isSignedIn
    //     ? <div className="flex gap-4 h-full bg-purple-400">
    //         {/* <ColorfulRequestPrintButton /> */}
    //         <div>
    //             <Link href={"/user/profile"}>
    //                 <div
    //                     className={`bg-gray-100 text-sm rounded-md hover:cursor-pointer hover:text-pnw-gold hover:fill-pnw-gold flex flex-row items-center gap-2 px-2 h-full bg-amber-400`}>
    //                     {session.isSignedIn
    //                         ? (
    //                             <div>
    //                                 <span className="text-nowrap">
    //                                     {/* ${session.account!
    //                                         .balanceInDollars
    //                                         .toFixed(2)}{" "} {accountDetails.account!.firstName}{" "}  */}
    //                                     ${(0).toFixed(2)} {session.account.firstName} {session.account.lastName}
    //                                 </span>
    //                             </div>
    //                         )
    //                         : (
    //                             <span>Account</span>
    //                         )}
    //                     <FontAwesomeIcon icon={faChevronRight} className="" />
    //                 </div>
    //             </Link>
    //         </div>
    //     </div>
    //     : (
    //         <div>
    //             <Link
    //                 // onClick={onLinkClick}
    //                 href="/user/login"
    //                 className="bg-pnw-gold-light text-sm whitespace-nowrap rounded-md bottom-0 h-fit flex gap-2 items-center px-4 py-2">
    //                 Sign in
    //                 <FontAwesomeIcon icon={faArrowRight} className="inline" />
    //             </Link>
    //         </div>
    //     );
}
