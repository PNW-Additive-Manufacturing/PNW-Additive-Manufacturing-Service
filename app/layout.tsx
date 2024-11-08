import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import { getJwtPayload, makeJwt, UserJWT } from "./api/util/JwtHelper";
import {
	AccountDetails,
	ColorfulRequestPrintButton,
	Footer,
	Navbar
} from "@/app/components/Navigation";
import { AccountPermission } from "./Types/Account/Account";
import { AccountProvider, ThemeProvider } from "./ContextProviders";
import AccountServe from "./Types/Account/AccountServe";
import HorizontalWrap from "./components/HorizontalWrap";
import { cookies, headers } from "next/headers";
import getConfig from "./getConfig";
import { login } from "./api/util/AccountHelper";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });
const envConfig = getConfig();

export async function generateMetadata(
	properties: any,
	parent: ResolvingMetadata
): Promise<Metadata> {
	return Promise.resolve({
		metadataBase: new URL(envConfig.hostURL),
		title: {
			template: "%s | AMS of PNW",
			default: "PNW Additive Manufacturing Service"
		},
		description:
			"Created by the PNW Additive Manufacturing Club, this service enables PNW students, and faculty members to explore the world of 3D Printing.",
		icons: ["/assets/am_logo.png"],
		applicationName: "Purdue Northwest Additive Manufacturing Service",
		category: "3D Printing",
		openGraph: {
			type: "website",
			siteName: "Purdue Northwest Additive Manufacturing Service",
			images: [`${envConfig.hostURL}/assets/am_banner.png`]
		}
	});
}

export default async function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	let permission: AccountPermission | null;
	let email: string | null;
	let jwtPayload: UserJWT | null = null;
	try {
		jwtPayload = await getJwtPayload();
		permission = jwtPayload?.permission as AccountPermission;
		email = jwtPayload?.email as string;
	} catch {
		permission = null;
		email = null;
	}

	return (
		<html lang="en" className="h-full">
			<head>
				<title>PNW Additive Manufacturing Service</title>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				<meta name="theme-color" content="#b1810b" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"></meta>
			</head>

			<body className={inter.className} style={{ height: "100vh" }}>
				<AccountProvider
					account={
						email == undefined
							? undefined
							: await AccountServe.queryByEmail(email)
					}>
					<ThemeProvider>
						{/* <div className="bg-gray-200">
							<HorizontalWrap className="text-cool-black opacity-50 w-full py-0 pt-1 pb-1 lg:text-right text-sm">
								Site is in{" "}
								<span className="font-semibold">
									testing mode
								</span>
								, no payments are fulfilled, nor should orders
								be considered actual!
							</HorizontalWrap>
						</div> */}
						<Navbar
							links={(() => {
								let elements: { name: string; path: string }[] = [
									{
										name: "Contact Us",
										path: "/team"
									},
									{
										name: "Schedule",
										path: "/schedule"
									},
									{
										name: "Our Inventory",
										path: "/materials"
									}
								];

								if (permission != null) {
									elements.push({
										name: "Your Requests",
										path: "/dashboard/user"
									});
									if (
										permission ==
										AccountPermission.Maintainer ||
										permission == AccountPermission.Admin
									) {
										elements.push({
											name: "Management",
											path: "/dashboard/maintainer"
										});
									}
								}
								return elements;
							})()}
							specialElements={(() => {
								if (email)
									email = email.substring(
										0,
										email.lastIndexOf("@")
									) as string;
								else email = "Account";

								if (permission)
									return (
										<>
											{" "}
											<ColorfulRequestPrintButton />{" "}
											<AccountDetails
												permission={permission}
												email={email}
											/>{" "}
										</>
									);
								else
									return (
										<AccountDetails
											permission={permission}
											email={email}
										/>
									);
							})()}
						/>
						<main
							className="w-full lg:mt-4 px-0 h-fit lg:pt-2"
							style={{ minHeight: "95vh" }}>
							<>
								{children}
								<ToastContainer
									position="bottom-left"
									autoClose={7500}
									// autoClose={false}
									hideProgressBar
									newestOnTop={false}
									closeOnClick
									rtl={false}
									pauseOnFocusLoss
									draggable
									pauseOnHover
									theme="light" />
							</>
						</main>
						<Footer />
					</ThemeProvider>
				</AccountProvider>
			</body>
		</html>
	);
}
