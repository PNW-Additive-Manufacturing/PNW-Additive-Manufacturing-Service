import "./globals.css";
import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import { getJwtPayload } from "./api/util/JwtHelper";
import {
	AccountDetails,
	ColorfulRequestPrintButton,
	Footer,
	Navbar
} from "@/app/components/Navigation";
import { AccountPermission } from "./Types/Account/Account";
import AuthProvider from "./authProvider";
import AccountServe from "./Types/Account/AccountServe";
import HorizontalWrap from "./components/HorizontalWrap";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(
	properties: any,
	parent: ResolvingMetadata
): Promise<Metadata> {
	return Promise.resolve({
		title: {
			template: "%s | AMS of PNW",
			default: "Purdue Northwest Additive Manufacturing Service"
		},
		description:
			"Created by the PNW Additive Manufacturing Club, this service enables PNW students, and faculty members to explore the world of 3D Printing.",
		icons: ["/assets/am_logo.png"],
		openGraph: {
			type: "website",
			images: ["/assets/am_banner.png"]
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
		let jwtPayload = await getJwtPayload();
		permission = jwtPayload?.permission as AccountPermission;
		email = jwtPayload?.email as string;
	} catch {
		permission = null;
		email = null;
	}

	// TEMP
	const account =
		email == undefined ? undefined : await AccountServe.queryByEmail(email);

	return (
		<html lang="en" className="h-full">
			<head>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"></meta>
			</head>

			<body className={inter.className} style={{ height: "100vh" }}>
				<AuthProvider account={account}>
					<Navbar
						links={(() => {
							if (permission == null) {
								return [];
							}
							let elements: { name: string; path: string }[] = [];
							elements.push({
								name: "Your Orders",
								path: "/dashboard/user"
							});
							if (
								permission == AccountPermission.Maintainer ||
								permission == AccountPermission.Admin
							) {
								elements.push({
									name: "Management Panel",
									path: "/dashboard/maintainer"
								});
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
						className="w-full lg:mt-4 px-0 h-fit"
						style={{ minHeight: "95vh" }}>
						{children}
					</main>
					<Footer />
				</AuthProvider>
			</body>
		</html>
	);
}
