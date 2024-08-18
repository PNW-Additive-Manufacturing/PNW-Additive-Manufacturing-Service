"use client";

import { createContext } from "react";
import Account from "./Types/Account/Account";

export type AuthContextData = {
	isSingedIn: boolean;
	account?: Account;
};

export const authContext = createContext<AuthContextData>({
	isSingedIn: false,
});

export default function AuthProvider({
	account,
	children,
}: {
	account?: Account;
	children: any;
}) {
	return (
		<authContext.Provider
			value={{
				isSingedIn: account != undefined,
				account: account,
			}}>
			{children}
		</authContext.Provider>
	);
}
