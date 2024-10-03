"use client";

import { createContext } from "react";
import Account from "./Types/Account/Account";

export const AccountContext = createContext<{
	isSingedIn: boolean;
	account?: Account;
}>({
	isSingedIn: false
});

export function AccountProvider({
	account,
	children
}: {
	account?: Account;
	children: React.ReactNode;
}) {
	return (
		<AccountContext.Provider
			value={{
				isSingedIn: account != undefined,
				account: account
			}}>
			{children}
		</AccountContext.Provider>
	);
}

export const ThemeContext = createContext<"white" | "dark">("white");

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
	);
}
