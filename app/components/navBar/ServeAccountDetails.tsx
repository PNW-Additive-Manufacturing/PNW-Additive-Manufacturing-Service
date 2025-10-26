import { serveSession } from "@/app/utils/SessionUtils";
import { faArrowRight, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { ColorfulRequestPrintButton } from "./ColorfulRequestPrintButton";

export async function ServeAccountDetails() {
    
    const session = await serveSession();

    return session.isSignedIn
        ? <div className="flex gap-4">
            <ColorfulRequestPrintButton />
            <div>
                <Link href={"/user/profile"}>
                    <div
                        className={`bg-gray-100 text-sm h-full rounded-md hover:cursor-pointer hover:text-pnw-gold hover:fill-pnw-gold flex flex-row items-center gap-2 px-3 py-1.5`}>
                        {session.isSignedIn
                            ? (
                                <div>
                                    <span className="text-nowrap">
                                        {/* ${session.account!
                                            .balanceInDollars
                                            .toFixed(2)}{" "} {accountDetails.account!.firstName}{" "}  */}
                                        ${(0).toFixed(2)} {session.account.firstName} {session.account.lastName}
                                    </span>
                                </div>
                            )
                            : (
                                <span>Account</span>
                            )}
                        <FontAwesomeIcon icon={faChevronRight} className="mt-0.5 h-3" />
                    </div>
                </Link>
            </div>
        </div>
        : (
            <div>
                <Link
                    // onClick={onLinkClick}
                    href="/user/login"
                    className="bg-pnw-gold-light text-sm whitespace-nowrap rounded-md bottom-0 h-fit flex gap-2 items-center px-4 py-2">
                    Sign in
                    <FontAwesomeIcon icon={faArrowRight} className="inline" />
                </Link>
            </div>
        );
}
