"use client";

import { AccountPermission } from "../Types/Account/Account";
import {
	RegularArrowRight,
	RegularCart,
	RegularChevronDown,
	RegularChevronRight,
	RegularCloudUpload,
	RegularFriendly,
	RegularHappy,
	RegularMenu,
	RegularSearchAlt,
	RegularShoppingBasket,
	RegularUpload,
	RegularUser
} from "lineicons-react";
import {
	CSSProperties,
	DetailedHTMLProps,
	Fragment,
	HTMLAttributes,
	MouseEventHandler,
	useContext,
	useState
} from "react";
import Image from "next/image";
import Link from "next/link";
import UserIcon from "./icons/UserIcon";
import { usePathname } from "next/navigation";
import HorizontalWrap from "./HorizontalWrap";
import { AccountContext } from "../ContextProviders";
import { CurrencySpan } from "./Spans";
import { CgProfile } from "react-icons/cg";
import { TbCube3dSphere } from "react-icons/tb";

function NavbarLink({
	name,
	path,
	onClick
}: {
	name: string;
	path: string;
	onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
	return (
		<Link
			onClick={onClick}
			href={path}
			className="rounded-md whitespace-nowrap xl:rounded-none text-base w-full p-3 xl:p-0 bg-gray-100 sm:bg-transparent xl:w-fit offset border-b-black border-opacity-5 hover:text-pnw-gold hover:border-b-pnw-gold hover:border-opacity-100 active:text-pnw-gold" style={{ fontSize: "16px" }}>
			{name}
		</Link>
	);
}

export function AccountDetails({
	permission,
	email,
	onLinkClick
}: {
	permission: AccountPermission | null;
	email: String | null;
	onLinkClick?: () => void;
}) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const accountDetails = useContext(AccountContext);

	return accountDetails.isSingedIn ? (
		<>
			<Link href={"/user/profile"}>
				<div
					onClick={() => setExpanded(() => !expanded)}
					className={`bg-gray-100 text-sm h-full rounded-md hover:cursor-pointer hover:text-pnw-gold hover:fill-pnw-gold flex flex-row items-center gap-2 px-3 py-0`}>
					{accountDetails.isSingedIn ? (
						<>
							<span className="text-nowrap">
								${accountDetails.account!.balanceInDollars.toFixed(2)}{" "}
								{accountDetails.account!.firstName}{" "}
								{accountDetails.account!.lastName}
							</span>
						</>
					) : (
						<span>Account</span>
					)}
					<RegularChevronRight className="inline mt-0.5" />
				</div>
			</Link>
		</>
	) : (
		<>
			<Link
				onClick={onLinkClick}
				href="/user/login"
				className="bg-pnw-gold-light text-sm whitespace-nowrap rounded-md bottom-0 h-fit flex gap-2 items-center px-4 py-2">
				Sign in
				<RegularArrowRight className="inline"></RegularArrowRight>
			</Link>
			{/* <Link
				onClick={onLinkClick}
				href="/user/create-account"
				className="text-center text-sm whitespace-nowrap rounded-md bottom-0  h-fit bg-pnw-gold-light flex flex-col gap-4 px-4 py-2">
				Create Account
			</Link> */}
		</>
	);
}

export function ColorfulRequestPrintButton() {
	return (
		<Link href={"/request-part"}>
			<button className="px-3.5 py-1.5 mb-0 text-sm bg-white outline-2 text-pnw-gold fill-pnw-gold outline outline-pnw-gold tracking-wider font-bold uppercase shadow-sm">
				Start Printing
				{/* <RegularArrowRight className="inline ml-2 mb-0.5" /> */}
			</button>
		</Link>
	);
}

function ScreenDimmer(
	props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {
	return (
		<div
			className="absolute top-0 left-0 w-full h-screen bg-black bg-opacity-20 xl:hidden"
			{...props}
		/>
	);
}

export function Navbar({
	links,
	includeIcon,
	specialElements,
	style
}: {
	links: { name: string; path: string }[];
	includeIcon?: boolean;
	specialElements?: JSX.Element;
	style?: CSSProperties;
}): JSX.Element {
	includeIcon = includeIcon ?? true;

	let [itemsExpanded, setExpanded] = useState<boolean>(false);

	const currentPath = usePathname();
	let currentPathSegments = currentPath.split("/");
	currentPathSegments = currentPathSegments.slice(
		1,
		currentPathSegments.length - 1
	);

	return (
		<div className="top-0 sticky shadow-md z-10">
			<div className="w-full h-fit bg-white py-3">
				<HorizontalWrap>
					{/* <div className="w-full px-6 py-3"> */}
					<nav className="h-full max-xl:flex overflow-x-clip w-full items-center align-middle">
						<div className="hidden xl:flex justify-between items-center gap-8">
							<div className="hidden xl:flex items-end justify-end tracking-wider gap-4 overflow-x-hidden">
								<Link
									href="/">
									<Image loading={"eager"} className="w-10" src={"/assets/am_cropped.png"} alt={"Additive Manufacturing"} style={{ aspectRatio: "194 / 130" }} width={194} height={130} priority={true}></Image>
									{/* <div className="text-nowrap text-xl tracking-wide flex-fit">
										<span className="text-pnw-gold">PNW </span>
										<span>Additive Manufacturing</span>
									</div> */}
								</Link>
								{links.map((val) => (
									<NavbarLink
										key={val.name}
										name={val.name}
										path={val.path}
									/>
								))}
							</div>
							<div className="flex gap-2">
								{specialElements == null ? (
									<></>
								) : (
									specialElements
								)}
							</div>
						</div>

						<Link href="/" className="mr-2 xl:hidden">
							<div className="w-10">
								<Image src={"/assets/am_cropped.png"} alt={"Additive Manufacturing"} width={194} height={130} priority={true}></Image>
							</div>
						</Link>

						{/* Small dropdown for mobile screens */}
						<RegularMenu
							className="xl:hidden text-right ml-auto h-full w-auto p-2"
							onClick={() => setExpanded(() => !itemsExpanded)}
						/>
						<div>
							{itemsExpanded ? (
								<>
									<ScreenDimmer />
									<div
										className={`absolute right-0 top-0 h-screen w-2/3 xl:hidden`}
										style={{
											boxShadow:
												"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
										}}>
										<div className="h-fit w-full pl-5 pr-5 py-3 bg-cool-black flex justify-between">
											<div className="w-fit whitespace-nowrap mr-fit pr-3 text-xl tracking-wide flex-fit text-white">
												<span>Menu</span>
											</div>
											<RegularMenu
												onClick={() =>
													setExpanded(
														() => !itemsExpanded
													)
												}
												className="fill-pnw-gold float-right text-right h-full w-auto p-2"></RegularMenu>
										</div>
										<div
											className="flex flex-col gap-2 bg-root h-remaining-screen-with-nav p-2 w-full"
											style={{
												backgroundColor:
													"rgb(248, 248, 248)"
											}}>
											{links.map((val) => (
												<NavbarLink
													onClick={() =>
														setExpanded(false)
													}
													key={val.name}
													name={val.name}
													path={val.path}
												/>
											))}
											{specialElements == null ? (
												<></>
											) : (
												specialElements
											)}
										</div>
									</div>
								</>
							) : (
								<></>
							)}
						</div>
					</nav>
					{/* </div> */}
				</HorizontalWrap>
			</div>
			{/* <div className="xl:hidden bg-gray-100">
				<div className="px-5 py-3 text-sm font-light">
					<a className="capitalize" href="/">
						Home
					</a>
					{currentPathSegments.map((segment, index, arr) => {
						const segments = arr.slice(0, index + 1);
						const fullPath = `/${segments.join("/")}`;
						const pathname = segment;
						return (
							<a
								key={pathname}
								className="capitalize"
								href={fullPath}>{` / ${pathname}`}</a>
						);
					})}
				</div>
			</div> */}
		</div>
	);
}

export function Footer(): JSX.Element {
	return (
		<div className="bg-black w-full h-fit shadow-2xl">
			<HorizontalWrap className="py-12 flex flex-col gap-6 md:gap-12 md:flex-row">
				<div>
					<p className="font-bold text-gray-100 text-sm">About Us</p>
					<Link href="/team" className="text-gray-300 my-2 text-xs">
						Our Team
					</Link>
					<br />
					<a
						className="text-gray-300 my-2 text-xs"
						href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
						PNW Design Studio
					</a>
					<br />
					<Link
						href={"/schedule"}
						className="text-gray-300 my-2 text-xs">
						Pickup Schedule
					</Link>
				</div>
				<div>
					<p className="font-bold text-gray-100 text-sm">
						Get in Touch
					</p>
					<a
						href="https://discord.gg/YtrnzPAfpV"
						target="_blank"
						className="text-gray-300 my-2 text-xs">
						Join our Discord
					</a>
					<br />
					<a
						rel="noopener"
						title="Visit Github"
						href="https://github.com/PNW-Additive-Manufacturing"
						target="_blank"
						className="text-gray-300 my-2 text-xs">
						Visit GitHub
					</a>
				</div>
				<div>
					<p className="text-gray-300 text-xs">
						Developed by <a href="mailto:jung416@pnw.edu">Aaron F Jung</a>.
					</p>
				</div>
			</HorizontalWrap>
		</div>
	);
}
