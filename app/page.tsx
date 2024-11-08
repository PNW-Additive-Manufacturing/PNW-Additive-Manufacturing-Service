"use server";

import Image from "next/image";
import HorizontalWrap from "./components/HorizontalWrap";
import Gallery from "./components/Gallery";
import Link from "next/link";
import { AvailabilityText } from "./components/LocalSchedule";
import { RegularArrowRight, RegularPackage } from "lineicons-react";

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
					<div className="xl:flex justify-between gap-6 lg:m-0">
						<div className="w-full">
							<h1 className="w-fit mb-4 text-3xl font-normal">
								Welcome to the
								<span className="font-bold">
									<span className="text-pnw-gold"> PNW </span>
									Additive Manufacturing Service
								</span>
							</h1>

							<p
								style={{ maxWidth: "600px" }}
								className="overflow-hidden full pb-4">
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

							<div className="pt-6">
								<div className="sm:flex gap-2">
									<a
										href={"/request-part"}
										className="block w-fit px-5 py-3 text-lg bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md shadow-sm">
										Get Started
									</a>
									<div className="flex gap-2">
										<Link
											href="/team"
											className="block w-fit px-2 lg:px-5 py-3 text-base tracking-wider font-light">
											Meet our Team
										</Link>
										<a
											href="https://mypnwlife.pnw.edu/AMC/club_signup"
											target="_blank"
											className="block w-fit px-2 lg:px-5 py-3 text-base tracking-wider font-light">
											Join MyPNW Life
										</a>
									</div>
								</div>

								<div className="mt-1">
									<AvailabilityText />
								</div>
							</div>
						</div>
						<div className="w-full xl:w-2/3 max-xl:mb-6 xl:pl-12">
							<Gallery
								buttonStyle="sphere"
								autoplay={true}
								slides={[
									<>
										<div className="bg-gray-100 rounded-md shadow-sm w-full h-72">
											<Image
												src={"/assets/lab_setup_1.jpg"}
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											We use top-of-the-line consumer 3D
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
										<div className="bg-gray-100 rounded-md shadow-sm w-full h-72">
											<Image
												src="/assets/am_simple_logos.jpg"
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Handouts in the form of a keychain
											for an event can be a fun and
											effective way to promote your event.
										</p>
									</>,
									<>
										<div className="bg-gray-100 rounded-md shadow-sm w-full h-72">
											<Image
												src="/assets/lion.jpg"
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Create multi-part art pieces at a
											large scale.
										</p>
									</>,
									<>
										<Image
											src="/assets/flower_print.jpg"
											width={760}
											height={760}
											alt=""
											className="pt-0 w-full bg-black rounded-md h-72"></Image>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Express your creativity by designing
											and requesting artistic models.
										</p>
									</>,
									<>
										<div className="bg-gray-100 rounded-md shadow-sm w-full h-72">
											<Image
												src="/assets/luke_moreno_battle_bot_2.jpg"
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Luke Moreno utilizes ABS filament to
											securely encase the electronics for
											three-pound Battle Bots.
										</p>
									</>
								]}></Gallery>
						</div>
					</div>
				</HorizontalWrap >

				<div className="bg-white py-8 pb-10">
					<HorizontalWrap>
						<div
							id="services">
							<div>
								<h2 className="w-fit font-medium text-2xl pb-2">
									Our Manufacturing Services
								</h2>
								<div className="w-fit lg:pr-24">
									Each production method offers different
									benefits and drawbacks. We recommend taking
									a look at an excellent guide by{" "}
									<a
										className="underline"
										target="_blank"
										href="https://xometry.pro/en-eu/articles/3d-printing-sla-vs-fdm/">
										Xometry (3D Technologies Comparison)
									</a>.
								</div>
							</div>
						</div>
						<hr />
						<div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mt-8">
							<div className="w-full">
								<Image src="/assets/Bambu+Lab+A1+3D+Printer+multi+color.png" alt="Bambu Lab A1 3D Printer" width={720} height={720} className="rounded-md mb-4 w-full h-52 object-cover" />
								<h2 className="text-lg text-pnw-gold font-semibold">FDM 3D Printing</h2>
								<p className="mt-2">Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing.</p>
							</div>

							<div className="bg-background p-4 w-full opacity-50 rounded-md">
								<Image src="/assets/mars4ultra.png" alt="Mars 4 Ultra Printer" width={720} height={720} className="rounded-md mb-4 w-full h-52 object-cover" />
								<h2 className="text-lg font-semibold">Resin 3D Printing</h2>
								<p className="mt-2">Coming 2025</p>
								<p className="mt-2">Optimal for creating detailed and smooth-surfaced models, ideal for small intricate parts.</p>
							</div>

							<div className="bg-background p-4 w-full opacity-50 rounded-md">
								<Image src="/assets/metalx.png" alt="Metal X Printer" width={720} height={720} className="rounded-md mb-4 w-full h-52 object-cover" />
								<h2 className="text-lg font-semibold">Markforged Metal X</h2>
								<p className="mt-2">Coming 2025</p>
								<p className="mt-2">The Metal X produces extremely strong custom metal parts designed for high-end applications.</p>
							</div>

							<div>
								<Link className="w-full" href="/materials">
									<button className="h-fit text-left opacity-75 mb-2 font-medium hover:opacity-100 bg-background text-cool-black fill-cool-black out">
										View our Inventory
										<RegularArrowRight className="inline ml-2 fill-inherit" />
									</button>
								</Link>
								<span>Browse our full inventory of 3D printers, materials, and processes, including lead times and costs.</span>
							</div>
						</div>


						{/* <div className="grid grid-cols-1 gap-12">
							<div className="flex flex-col lg:flex-row gap-4">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/Bambu+Lab+A1+3D+Printer+multi+color.png"
									width={720}
									height={720}></Image>
								<div className="py-1 2xl:w-1/2">
									<span className="text-pnw-gold text-lg font-semibold">
										FDM 3D Printing
									</span>{" "}
									involves melting thermoplastic filament and
									layering it to create objects. It can be
									used for prototyping, allowing designers to
									quickly test and iterate on designs.
									<ul className="mt-2">
										<li>
											Rapid and cost-effective
											prototyping.
										</li>
										<li>
											Materials: PLA, PLA Aero, PETG, ABS,
											TPU, CF, PC, and more!
										</li>
									</ul>
								</div>
							</div>
							<div className="flex flex-col lg:flex-row gap-4">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/miniatures-category.png"
									width={720}
									height={720}></Image>
								<div className="py-1 2xl:w-1/2">
									<span className="text-pnw-gold text-lg font-semibold">
										SLA/LCD Resin Printing
									</span>{" "}
									enables creation of highly detailed and
									intricate designs. This method is especially
									suited for applications like jewelry, dental
									models, and miniature figures.
									<ul className="mt-2">
										<li>
											Unmatched precision and smoothness.
										</li>
										<li>Arriving November 2024.</li>
									</ul>
								</div>
							</div>
							<a
								id="metalX"
								className="flex flex-col lg:flex-row gap-4 font-normal">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/metal_f.jpg"
									width={720}
									height={720}></Image>
								<div className="py-1 2xl:w-1/2">
									<span className="text-pnw-gold text-lg font-semibold">
										Markforged Metal X
									</span>{" "}
									utilizes a unique process to produce metal
									parts. It starts with a composite of metal
									powder and a FDM-like polymer binder
									filament, which is 3D printed into the
									desired shape. After printing, the part
									undergoes a debinding process to remove the
									binding polymer, followed by sintering in a
									furnace to achieve full density and
									strength.
									<ul className="mt-2">
										<li>
											Custom in-university machined metal
											parts.
										</li>
										<li>
											Materials: 17-4PH Stainless Steel,
											H13 Tool Steel, and more!
										</li>
										<li>Arriving Spring 2025.</li>
									</ul>
								</div>
							</a>
						</div> */}
					</HorizontalWrap>
				</div>
				{/* <HorizontalWrap className="py-8">
					Looking to learn more?
					<div className="flex flex-col md:flex-row w-fit mt-6 gap-2 justify-center">
						<DiscordServer />
						<GithubProject />
					</div>
				</HorizontalWrap> */}
			</div >
		</>
	);
}
