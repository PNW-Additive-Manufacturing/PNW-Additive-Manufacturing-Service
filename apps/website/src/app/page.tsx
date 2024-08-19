"use server";

import Image from "next/image";
import HorizontalWrap from "./components/HorizontalWrap";
import Head from "next/head";
import GeolocationLookup from "./api/util/FindIP";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import Gallery from "./components/Gallery";
import { Metadata, ResolvingMetadata } from "next";

function DiscordServer() {
	return (
		<a
			href="https://discord.gg/YtrnzPAfpV"
			target="_blank"
			className="group text-white bg-cool-black text-sm px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm">
			Talk with us on Discord
			<Image
				className="w-auto h-6 group fill-white"
				src="/assets/discord-mark-white.svg"
				alt="GitHub Logo"
				width={50}
				height={50}></Image>
		</a>
	);
}

function GithubProject() {
	return (
		<a
			href="https://github.com/PNW-Additive-Manufacturing"
			target="_blank"
			className="group text-white text-sm bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm">
			Learn more on Github
			<Image
				className="w-auto h-6 group"
				src="/assets/github-mark.svg"
				alt="GitHub Logo"
				width={50}
				height={50}></Image>
		</a>
	);
}

export default async function Home() {
	return (
		<>
			<div>
				<HorizontalWrap>
					<div className="lg:flex justify-between gap-6 lg:m-0">
						<div className="w-full lg:mb-10">
							<h1 className="w-fit mb-6 text-3xl">
								Welcome to the
								<span className="text-pnw-gold"> PNW </span>
								Additive Manufacturing Service
							</h1>

							<p
								style={{ maxWidth: "600px" }}
								className="overflow-hidden w-full pb-4">
								Created by the PNW Additive Manufacturing Club,
								this service enables PNW students, and faculty
								members to explore the world of 3D Printing.
								Operating in the Purdue Northwest{" "}
								<a
									className="underline"
									href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
									Design Studio
								</a>
								.
							</p>

							<ul>
								<li>Rapid-Prototyping</li>
								<li>Connectors / Mounts</li>
								<li>Prosthetics</li>
								<li>Creative Models</li>
							</ul>

							<div className="pt-10">
								<a
									href={"/request-part"}
									className="block w-fit px-5 py-3 text-lg bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md shadow-sm">
									Get Started
								</a>
								<a
									href={"/schedule"}
									className="block w-fit px-3 py-3 text-xs tracking-wider underline">
									Or, Meet a Technician!
								</a>

								<div className="flex flex-col md:flex-row w-fit mt-6 gap-2 justify-center">
									<DiscordServer />
									<GithubProject />
								</div>
							</div>
						</div>
						<div
							className="w-full lg:w-2/3"
							style={{ minHeight: "432px" }}>
							<Gallery
								buttonStyle="sphere"
								autoplay={true}
								slides={[
									<>
										<div className="p-2 bg-gray-100 rounded-md shadow-sm mt-4 w-full h-84">
											<Image
												src={"/assets/lab_setup_1.jpg"}
												width={760}
												height={760}
												alt=""
												className="w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											We offer top-of-the-line consumer 3D
											Printers from{" "}
											<a
												href="https://bambulab.com/en/about-us"
												target="_blank"
												className="underline">
												Bambu Lab
											</a>
											.
										</p>
									</>,
									<>
										<div className="p-2 bg-gray-100 rounded-md shadow-sm mt-4 w-full h-84">
											<Image
												src="/assets/am_simple_logos.jpg"
												width={760}
												height={760}
												alt=""
												className="w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Design and print a handout for an
											event.
										</p>
									</>,
									<>
										<div className="flex justify-center w-full gap-4">
											<div className="p-2 bg-gray-100 rounded-md shadow-sm mt-4 w-auto h-84">
												<Image
													src="/assets/flower_print.jpg"
													width={760}
													height={760}
													alt=""
													className="w-full h-full bg-black rounded-md"></Image>
											</div>
											<div className="max-lg:hidden p-2 bg-gray-100 rounded-md shadow-sm mt-4 w-auto h-84">
												<Image
													src="/assets/ben_figure.jpg"
													width={760}
													height={760}
													alt=""
													className="w-full h-full bg-black rounded-md"></Image>
											</div>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Design and print artistic models.
										</p>
									</>,
									<>
										<div className="p-2 bg-gray-100 rounded-md shadow-sm mt-4 w-full h-84">
											<Image
												src="/assets/luke_moreno_battle_bot_2.jpg"
												width={760}
												height={760}
												alt=""
												className="w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Luke moreno competes three pound
											competitions, utilizing a housing
											crafted from ABS filament to
											securely encase the electronics.
										</p>
									</>
								]}></Gallery>
						</div>
					</div>
				</HorizontalWrap>

				<div>
					<HorizontalWrap>
						{/* <h2 className="w-full text-center text-2xl font-normal my-4">
							Our Manufacturing Services
						</h2> */}

						<div
							className="xl:flex gap-6 justify-between"
							id="services">
							<div>
								<div className="w-fit text-2xl py-2">
									Our Manufacturing Services
								</div>
								<div className="w-fit lg:pr-24 pt-2 border-t-2 border-t-gray-200">
									Each production method offers different
									benefits and drawbacks. We recommend taking
									look at an excellent guide by{" "}
									<a
										className="underline text-pnw-gold"
										target="_blank"
										href="https://xometry.pro/en-eu/articles/3d-printing-sla-vs-fdm/">
										Xometry (3D Technologies Comparison)
									</a>
									.
								</div>
							</div>
							<div className="max-lg:mt-4 lg:flex justify-center">
								<div className="lg:text-center">
									<div className="w-full lg:px-4 xl:w-64 py-3 border-b-2 border-b-pnw-gold">
										3D Printing (FDM)
									</div>
									<div className="w-full lg:px-4 mt-2">
										Available
									</div>
								</div>
								<div className="lg:text-center">
									<div className="w-full lg:px-4 xl:w-64 py-3 border-b-2 border-b-pnw-gold">
										Resin Printing (SLA)
									</div>
									<div className="w-full lg:px-4 mt-2">
										Coming 2025
									</div>
								</div>
								<div className="lg:text-center">
									<div className="w-full lg:px-4 xl:w-64 py-3 border-b-2 border-b-gray-300">
										Waterjet
									</div>
									<div className="w-full lg:px-4 mt-2">
										In Design Studio
									</div>
								</div>
							</div>
						</div>
					</HorizontalWrap>
				</div>
			</div>
		</>
	);
}

function GalleryImageWithDescription({
	title,
	description,
	slides
}: {
	title: string;
	description: string;
	slides: JSX.Element[];
}) {
	return (
		<div className="lg:w-1/3">
			<Gallery buttonStyle={"compact"} slides={slides} />
			<div className="px-5 pb-5">
				<h2 className="text-2xl font-normal mt-2">{title}</h2>
				<p className="text-sm mt-2">{description}</p>
			</div>
		</div>
	);
}
