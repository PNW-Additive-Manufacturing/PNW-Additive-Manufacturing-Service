"use server";

import Image from "next/image";
import HorizontalWrap from "./components/HorizontalWrap";
import Gallery from "./components/Gallery";

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
							<h1 className="w-fit mb-6 text-3xl font-normal">
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

								{/* <div className="flex flex-col md:flex-row w-fit mt-6 gap-2 justify-center">
									<DiscordServer />
									<GithubProject />
								</div> */}
							</div>
						</div>
						<div
							className="w-full lg:w-2/3 max-lg:mb-6 pl-12"
							style={{ minHeight: "432px" }}>
							<Gallery
								buttonStyle="sphere"
								autoplay={true}
								slides={[
									<>
										<div className="bg-gray-100 rounded-md shadow-sm mt-4 w-full h-72">
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
										<div className="bg-gray-100 rounded-md shadow-sm mt-4 w-full h-72">
											<Image
												src="/assets/am_simple_logos.jpg"
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Handouts in the form of a keychain
											or bagchain for an event can be a
											fun and effective way to promote
											your event.
										</p>
									</>,
									<>
										<div className="bg-gray-100 rounded-md shadow-sm mt-4 w-full h-72">
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
										<div className="flex justify-center w-full gap-4">
											<div className="bg-gray-100 rounded-md shadow-sm mt-4 w-auto h-72">
												<Image
													src="/assets/flower_print.jpg"
													width={760}
													height={760}
													alt=""
													className="pt-0 w-full h-full bg-black rounded-md"></Image>
											</div>
											<div className="max-lg:hidden bg-gray-100 rounded-md shadow-sm mt-4 w-auto h-72">
												<Image
													src="/assets/ben_figure.jpg"
													width={760}
													height={760}
													alt=""
													className="pt-0 w-full h-full bg-black rounded-md"></Image>
											</div>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Express your creativity by designing
											and requesting artistic models.
										</p>
									</>,
									<>
										<div className="bg-gray-100 rounded-md shadow-sm mt-4 w-full h-72">
											<Image
												src="/assets/luke_moreno_battle_bot_2.jpg"
												width={760}
												height={760}
												alt=""
												className="pt-0 w-full h-full bg-black rounded-md"></Image>
										</div>
										<p className="text-base px-2 lg:text-center w-full font-light mt-2">
											Luke moreno utilizes ABS filament to
											securely encase the electronics for
											three-pound Battle Bots.
										</p>
									</>
								]}></Gallery>
						</div>
					</div>
				</HorizontalWrap>

				<div className="bg-white py-8 pb-10">
					<HorizontalWrap>
						<div
							className="xl:flex gap-6 justify-between"
							id="services">
							<div>
								<div className="w-fit font-normal text-2xl pb-2">
									Our Manufacturing Services
								</div>
								<div className="w-fit lg:pr-24 pt-2">
									Each production method offers different
									benefits and drawbacks. We recommend taking
									a look at an excellent guide by{" "}
									<a
										className="underline text-pnw-gold"
										target="_blank"
										href="https://xometry.pro/en-eu/articles/3d-printing-sla-vs-fdm/">
										Xometry (3D Technologies Comparison)
									</a>
									.
								</div>
							</div>
						</div>
						<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
							<div className="flex flex-col lg:flex-row gap-4">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/Bambu+Lab+A1+3D+Printer+multi+color.png"
									width={720}
									height={720}></Image>
								<div>
									<span className="text-pnw-gold">
										3D printing using Fused Deposition
										Modeling (FDM)
									</span>{" "}
									involves melting thermoplastic filament and
									layering it to create objects. It can be
									used for prototyping, allowing designers to
									quickly test and iterate on designs. FDM is
									also ideal for producing custom parts, such
									as brackets or tools, tailored to specific
									needs.
								</div>
							</div>
							<div className="flex flex-col lg:flex-row gap-4 opacity-70">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/metal_f.jpg"
									width={720}
									height={720}></Image>
								<div>
									The{" "}
									<span className="text-pnw-gold">
										Markforged Metal X (Coming October 2024)
									</span>{" "}
									utilizes a unique process to produce metal
									parts. It starts with a composite of metal
									powder and a polymer binder, which is 3D
									printed into the desired shape. After
									printing, the part undergoes a debinding
									process to remove the polymer, followed by
									sintering in a furnace to achieve full
									density.
								</div>
							</div>
							<div className="flex flex-col lg:flex-row gap-4 opacity-70">
								<Image
									className="w-full max-lg:h-44 lg:w-48 shadow-md rounded-md"
									alt=""
									src="/assets/miniatures-category.png"
									width={720}
									height={720}></Image>
								<div>
									<span className="text-pnw-gold">
										SLA Resin Printing (Coming December
										2024)
									</span>{" "}
									photopolymer resin is cured layer by layer.
									The printer uses an LCD screen to project UV
									that selectively harden the resin, enabling
									the creation of highly detailed and
									intricate designs. This method is especially
									suited for applications like jewelry, dental
									models, and miniatures, thanks to its
									ability to produce fine details and smooth
									finishes.
								</div>
							</div>
						</div>
					</HorizontalWrap>
				</div>
				<HorizontalWrap className="py-8">
					Looking to learn more?
					<div className="flex flex-col md:flex-row w-fit mt-6 gap-2 justify-center">
						<DiscordServer />
						<GithubProject />
					</div>
				</HorizontalWrap>
			</div>
		</>
	);
}
