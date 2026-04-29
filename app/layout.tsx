import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-toastify/dist/ReactToastify.css';
import { serveOptionalSession } from "./api/util/SessionHelper";
import "./globals.css";


import { AccountDetails } from "@/app/components/navBar/AccountDetails";
import { ColorfulRequestPrintButton } from "@/app/components/navBar/ColorfulRequestPrintButton";
import { Footer } from '@/app/components/navBar/Footer';
import { Navbar } from "@/app/components/navBar/Navigation";


import { AccountProvider, ThemeProvider } from "./ContextProviders";
import { AccountPermission } from "./Types/Account/Account";
import AccountServe from "./Types/Account/AccountServe";

import getConfig from "./getConfig";

import { ToastContainer } from "react-toastify";
import { FloatingFormContainer } from "./components/FloatingForm";

const inter = Inter({ subsets: ["latin"] });
const envConfig = getConfig();

export async function generateMetadata(
	properties: any,
	parent: ResolvingMetadata
): Promise<Metadata> {
	return Promise.resolve({
		metadataBase: new URL(envConfig.hostURL),
		title: "PNW Additive Manufacturing Lab",
		description: "Providing PNW students and faculty with access to advanced 3D Printing technology.",
		icons: ["/assets/am_logo_light.png"],
		applicationName: "PNW Additive Manufacturing Lab",
		category: "3D Printing",
		themeColor: "#f5b626",
		openGraph: {
			url: envConfig.hostURL,
			siteName: "PNW Additive Manufacturing Club",
			type: "website",
			title: "PNW Students: 3D Print Your Designs at PNW",
			description: "Providing PNW students and faculty with access to advanced 3D Printing technology.",
			locale: "en_US",
			images: []
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
	try {
		const jwtPayload = await serveOptionalSession();
		permission = jwtPayload?.permission as AccountPermission;
		email = jwtPayload?.email as string;
	} catch {
		permission = null;
		email = null;
	}

	return (
		<html lang="en" className="h-full">
			<head>
				<title>PNW Additive Manufacturing Lab</title>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link rel="preload" href="/assets/logo.svg" as="image" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
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

						<Navbar
							links={(() => {
								let elements: { name: string; path: string }[] = [
									{
										name: "Materials",
										path: "/materials"
									},
									{
										name: "Projects",
										path: "/project-spotlight"
									},
									{
										name: "Leadership",
										path: "/team"
									},
									// {
									// 	name: "Schedule",
									// 	path: "/schedule"
									// }
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
											name: "Management Panel",
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
							className="w-full px-0 h-fit"
							style={{ minHeight: "95vh" }}>
							<>
								<FloatingFormContainer>
									{children}
								</FloatingFormContainer>
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
