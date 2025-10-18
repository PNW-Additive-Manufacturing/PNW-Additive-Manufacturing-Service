"use client";

import Link from "next/link";
import {AccountContext} from "../../ContextProviders";
import {AccountPermission} from "../../Types/Account/Account";
import {RegularArrowRight, RegularChevronRight} from "lineicons-react";
import {useContext, useState} from "react";

export function AccountDetails({onLinkClick} : {
    permission: AccountPermission | null;
    email: String | null;
    onLinkClick?: () => void;
}) {
    const [expanded,
        setExpanded] = useState < boolean > (false);
    const accountDetails = useContext(AccountContext);

    return accountDetails.isSingedIn
        ? (
            <div>
                <Link href={"/user/profile"}>
                    <div
                        onClick={() => setExpanded(() => !expanded)}
                        className={`bg-gray-100 text-sm h-full rounded-md hover:cursor-pointer hover:text-pnw-gold hover:fill-pnw-gold flex flex-row items-center gap-2 px-3 py-0`}>
                        {accountDetails.isSingedIn
                            ? (
                                <div>
                                    <span className="text-nowrap">
                                        ${accountDetails.account !
                                            .balanceInDollars
                                            .toFixed(2)}{" "} {accountDetails.account !.firstName}{" "} {accountDetails.account !.lastName}
                                    </span>
                                </div>
                            )
                            : (
                                <span>Account</span>
                            )}
                        <RegularChevronRight className="inline mt-0.5"/>
                    </div>
                </Link>
            </div>
        )
        : (
            <div>
                <Link
                    onClick={onLinkClick}
                    href="/user/login"
                    className="bg-pnw-gold-light text-sm whitespace-nowrap rounded-md bottom-0 h-fit flex gap-2 items-center px-4 py-2">
                    Sign in
                    <RegularArrowRight className="inline"></RegularArrowRight>
                </Link>
            </div>
        );
}