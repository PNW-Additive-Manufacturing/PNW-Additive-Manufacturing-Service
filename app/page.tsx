"use server";

import Image from "next/image";
import HorizontalWrap from "./components/HorizontalWrap";
import Gallery from "./components/Gallery";
import Link from "next/link";
import { AvailabilityText } from "./components/LocalSchedule";
import { RegularArrowRight, RegularDiamondAlt, RegularDiamondShape, RegularPackage, RegularPointerRight } from "lineicons-react";
import ProjectSpotlightServe from "./Types/ProjectSpotlight/ProjectSpotlightServe";
import { ProjectCard } from "./project-spotlight/ProjectCard";
import { MdOutlineExplore } from "react-icons/md";
import { FaArrowRightLong, FaChevronRight } from "react-icons/fa6";
import AMImage from "./components/AMImage";

// function DiscordServer() {
// 	return (
// 		<a
// 			href="https://discord.gg/YtrnzPAfpV"
// 			target="_blank"
// 			className="group text-white bg-cool-black text-sm px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm">
// 			Talk with us on Discord
// 			<Image
// 				className="w-auto h-6 group fill-white"
// 				src="/assets/discord-mark-white.svg"
// 				alt="GitHub Logo"
// 				width={50}
// 				height={50}></Image>
// 		</a>
// 	);
// }

// function GithubProject() {
// 	return (
// 		<a
// 			href="https://github.com/PNW-Additive-Manufacturing"
// 			target="_blank"
// 			className="group text-white text-sm bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm">
// 			Learn more on Github
// 			<Image
// 				className="w-auto h-6 group"
// 				src="/assets/github-mark.svg"
// 				alt="GitHub Logo"
// 				width={50}
// 				height={50}></Image>
// 		</a>
// 	);
// }


const MapEmbed = () => {
	return (
		<div className="w-full h-[450px]">
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d595.9940031434936!2d-87.47228416193505!3d41.587223515169036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8811de119bd6a485%3A0x1cb62e96c575a358!2sUniversity%20Services%2C%202233%20171st%20St%2C%20Hammond%2C%20IN%2046323!5e0!3m2!1sen!2sus!4v1745448045531!5m2!1sen!2sus"
				width="100%"
				height="100%"
				style={{ border: 0 }}
				allowFullScreen
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				title="Design Studio Location"
			></iframe>
		</div>
	);
};


export default async function Home() {

	const showcases = await ProjectSpotlightServe.queryAllProjectShowcases();
	await ProjectSpotlightServe.withManyAttachments(showcases);

	return (
		<>
			<div>

				<HorizontalWrap className="my-14">
					<div className="xl:flex justify-center gap-10 lg:m-0 lg:text-center">
						<div className="w-fit mb-2">
							<h1 className="w-fit mb-4 text-3xl font-normal lg:text-center mx-auto">
								{/* <span>Welcome to the</span> */}
								<span className="font-bold text-center">
									<span className="text-pnw-gold"> PNW </span>
									Additive Manufacturing Service
								</span>
							</h1>

							<p
								style={{ maxWidth: "600px" }}
								className="overflow-hidden full pb-4">
								Created by the PNW Additive Manufacturing and ASME Club,
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

							{/* <ul style={{ maxWidth: "600px" }}>
								<li>Utilize rapid prototyping to create custom connectors and mounts.</li>
								<li>Produce creative models, prosthetics, and more with 3D Printing solutions.</li>
								<li>Guidance in designing or optimizing models for 3D Printing using <Link className="underline" target="_blank" href={"https://www.onshape.com/en/"}>Onshape</Link>.</li>
							</ul> */}

							<div className="pt-2 lg:pt-6 lg:mx-auto w-fit">
								<div className="flex flex-wrap items-center gap-4">
									<Link href={"/request-part"}>
										<button className="w-fit px-3.5 py-2.5 mb-0 text-sm bg-white outline-2 text-pnw-gold fill-pnw-gold outline outline-pnw-gold tracking-wider font-bold uppercase shadow-sm">
											Get Printing
											<RegularArrowRight className="inline ml-2 mb-0.5" />
										</button>
									</Link>
									<Link
										href="/team"
										className="w-fit tracking-wider hidden lg:block font-light text-sm">
										Meet our Team
									</Link>
									<a
										href="https://mypnwlife.pnw.edu/AMC/club_signup"
										target="_blank"
										className="block w-fit tracking-wider font-light text-sm">
										Join MyPNW Life
									</a>
								</div>


							</div>
						</div>

						{/* <div className="mb-6">
							<video src={"/assets/Timeline 1.mp4"} className="max-2xl:hidden rounded-md ml-auto" style={{ maxHeight: "17.5rem" }} controls muted={true} loop={true} preload={"none"} playsInline={true} poster="/assets/lab_setup_1.jpg" />
						</div> */}
					</div>
				</HorizontalWrap>
				{/* 
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 54" preserveAspectRatio="xMidYMid slice">
					<g>
						<path d="M0 2 L1440 2" stroke="#b1810b" opacity={0.5} stroke-width="2" fill="none" />
						<path d="M0 12 L1440 12" stroke="#c3932b" opacity={0.5} stroke-width="2" fill="none" />
						<path d="M0 22 L1440 22" stroke="#d5a64c" opacity={0.5} stroke-width="2" fill="none" />
						<path d="M0 32 L1440 32" stroke="#e6b96d" opacity={0.5} stroke-width="2" fill="none" />
						<path d="M0 42 L1440 42" stroke="#f0cd8e" opacity={0.5} stroke-width="2" fill="none" />
						<path d="M0 52 L1440 52" stroke="#fae1af" opacity={0.5} stroke-width="2" fill="none" />
					</g>
				</svg> */}

				{/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -3 1440 60" opacity={0.65} preserveAspectRatio="xMidYMid slice">
					<g>
						<path d="M0 0 L1440 0" stroke="#b1810b" stroke-width="3" fill="none" />
						<path d="M0 8 L1440 8" stroke="#c3932b" stroke-width="3" fill="none" />
						<path d="M0 16 L1440 16" stroke="#d5a64c" stroke-width="3" fill="none" />
						<path d="M0 24 L1440 24" stroke="#e6b96d" stroke-width="3" fill="none" />
						<path d="M0 32 L1440 32" stroke="#f0cd8e" stroke-width="4" fill="none" />
						<path d="M0 40 L1440 40" stroke="#fae1af" stroke-width="4.5" fill="none" />
						<path d="M0 48 L1440 48" stroke="#fceac9" stroke-width="5" fill="none" />
						<path d="M0 56 L1440 56" stroke="white" stroke-width="7" fill="none" />
					</g>
				</svg> */}

				<svg className="bg-white hidden lg:block" viewBox="0 30 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
					<path className="fill-background" d="
						M0,80 
						C360,40 1080,40 1440,80 
						L1440,0 
						L0,0 
						Z" />
				</svg>


				{/* <div className="bg-white py-8">
					<HorizontalWrap>
						<h2 className="w-fit font-medium text-xl pb-2">What is Possible?</h2>
						<div className="w-fit">
							You can befit from our engineering and club resources.
						</div>
						<hr style={{ marginBottom: "0px" }} />


					</HorizontalWrap>
				</div> */}

				{/* <div className="bg-white py-8">
					<HorizontalWrap>
						<h2 className="text-center font-medium text-xl">Project Spotlights</h2>
						<br />
						<br />

						<div className="grid grid-cols-2">
							<div>
								<Image className="rounded-md lg:w-1/2 shadow-md mx-auto" style={{ aspectRatio: "auto 4/3" }} src={"/assets/car_thing.jpg"} alt={""} width={720} height={720}></Image>
								<div className="mt-4">
									<h2>Reiving the Spotify Car Thing</h2>
									<p>This project used 3D Printing to create a high-strength mount which attaches to your monitor using the DeskThing Firmware.</p>
								</div>
							</div>
							<div>
								<Image className="rounded-md lg:w-1/2 shadow-md mx-auto" style={{ aspectRatio: "auto 4/3" }} src={"/assets/car_thing.jpg"} alt={""} width={720} height={720}></Image>
								<div className="mt-4">
									<h2>Reiving the Spotify Car Thing</h2>
									<p>This project used 3D Printing to create a high-strength mount which attaches to your monitor using the DeskThing Firmware.</p>
								</div>
							</div>
						</div>

					</HorizontalWrap>
				</div> */}


				<div className="bg-white py-8 lg:py-12 lg:pt-0">
					<HorizontalWrap>

						<h2 className="font-medium text-2xl pb-2 w-full text-center">See what <span className="font-bold">Students Created</span></h2>
						<p className="text-cool-black text-center">Students, faculty and professors bring ideas to reality using Additive Manufacturing.</p>

						<div className="flex flex-col gap-4 mt-8">

							<div className="grid grid-rows-1 max-md:grid-rows-12 md:grid-cols-5 lg:grid-cols-10 gap-4">

								{showcases.slice(0, Math.min(showcases.length, 3)).map((s, i) => <div key={s.id} className={`
									rounded-md bg-background row-span-4 md:col-span-2 lg:col-span-3
									${i >= 3 ? 'hidden' : ''}
									md:${i >= 2 ? 'hidden' : ''}
									lg:inline
									`}>

									<ProjectCard projectData={s} editable={false} key={s.id} style={"normal"} />

								</div>)}

								<div className="flex justify-center items-center mt-2">
									<a href="/project-spotlight">
										<button className="bg-background rounded-full p-3 text-2xl w-fit h-fit mb-0 fill-cool-black hover:fill-white" type="button">
											<FaChevronRight className="fill-inherit" style={{ width: "1em", height: "1em" }} />
										</button>
									</a>
								</div>

								{/* <a href="/project-spotlight" className="col-start-5 col-span-2">
									<button className="flex py-4 items-center justify-between text-cool-black bg-background" type="button">
										View Posts
										<FaChevronRight style={{ width: "1em", height: "1em" }} />

									</button>
								</a> */}

							</div>

						</div>
					</HorizontalWrap>
				</div>

				<div className="bg-white">
					<HorizontalWrap>
						<svg className="opacity-50 hidden lg:block" viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
							<defs>
								<linearGradient id="pnwGoldOnlyWave" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#b1810b" />         {/* PNW Gold */}
									<stop offset="40%" stopColor="#e6b10e" />        {/* PNW Gold Logo */}
									<stop offset="100%" stopColor="#f1e8d3" />       {/* PNW Gold Light */}
								</linearGradient>
							</defs>
							<path
								d="M16 25 C 360 0, 1080 50, 1424 25"
								stroke="url(#pnwGoldOnlyWave)"
								strokeWidth="10"  // Increased for more pronounced roundness
								fill="none"
								strokeLinecap="round"  // Ensures rounded edges
							/>
						</svg>
					</HorizontalWrap>
				</div>

				<div className="bg-white pt-0 lg:py-12">
					<HorizontalWrap>
						<div id="services">
							<div>
								<h2 className="font-medium text-2xl pb-2 w-full"><span className="font-bold">Additive Manufacturing Machines</span> in Hammond (Design Studio)</h2>
								<div className="text-cool-black">
									Each production method offers different
									benefits and drawbacks. We recommend taking
									a look at an excellent guide by{" "}
									<a
										className="underline"
										target="_blank"
										href="https://xometry.pro/en-eu/articles/3d-printing-sla-vs-fdm/">
										Xometry (3D Comparisons)
									</a>.
								</div>
							</div>
						</div>
						{/* <hr style={{ marginBottom: "0px" }} /> */}
						<br />
						<div className="flex justify-between gap-4 lg:gap-6">
							<div className="grid xl:grid-cols-5 gap-4 lg:gap-6">

								<div className="bg-background p-4 w-full rounded-md">
									<div className="w-full text-sm">
										<div className="px-10 max-lg:hidden">
											<AMImage src="/assets/bambu_x1e_with_ams.png" alt="Bambu Lab A1 3D Printer" width={388} height={517} className="mb-4" />
										</div>
										<h2 className="text-lg font-semibold">Classical FDM Printing</h2>
										<p className="mt-2">Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing.</p>
									</div>
								</div>

								<div className="bg-background p-4 w-full rounded-md">
									<div className="w-full text-sm">
										<div className="px-10 max-lg:hidden">
											<AMImage src="/assets/mars4ultra.png" alt="Mars 4 Ultra Printer" width={388} height={517} className="mb-4" />
										</div>
										<h2 className="text-lg font-semibold">Precise Resin Printing</h2>
										<p className="mt-2">Optimal for creating detailed and smooth-surfaced models, ideal for small intricate parts.</p>
									</div>
								</div>

								<div className="bg-background p-4 w-full rounded-md">
									<div className="w-full text-sm">
										<div className="px-10 max-lg:hidden">
											<AMImage src="/assets/metalx.png" alt="Metal X Printer" width={388} height={517} className="mb-4" />
										</div>
										<h2 className="text-lg font-semibold">Markforged Metal X</h2>
										<p className="mt-2">Looking for Funding</p>
										<p className="mt-2">The Markforged Metal X produces extremely strong custom metal parts.</p>
									</div>
								</div>


								<div className="bg-background p-4 w-full rounded-md">
									<div className="w-full text-sm">
										<div className="px-10 max-lg:hidden">
											<AMImage src="/assets/fuse_1_store_thumb_2x_1.png" alt="FormLabs Fuse 1+ 30W" width={388} height={517} className="mb-4" />
										</div>
										<h2 className="text-lg font-semibold">SLS Fuse 1+ 30W</h2>
										<p className="mt-2">Looking for Funding</p>
										<p className="mt-2">Designed for industrial-quality production using nylon powders</p>
									</div>
								</div>

							</div>
						</div>
						<div className="w-full lg:w-1/3 mt-4">
							<Link className="w-full" href="/materials">
								<button className="text-left flex justify-between" type="button">
									View our Materials and Processes
									<RegularDiamondAlt className="inline fill-white ml-2 mt-0.5" />
								</button>
							</Link>
							{/* <p className="text-cool-black text-sm">Browse our full inventory of materials, and processes, including lead times and costs.</p> */}
						</div>
					</HorizontalWrap>
				</div>

				{/* <div className="py-10">
					<HorizontalWrap>

						<h2 className="text-xl font-medium mb-2">Our Sponsors and Donators</h2>
						<p>We are incredibly grateful to our sponsors and donators, whose generous support enables us to push the boundaries of Additive Manufacturing at Purdue Northwest.</p>
						<div className="flex gap-12 py-6 opacity-65">
							<Image className="h-14 w-fit py-2" src={"/assets/logos/bambulab.png"} alt={"Bambu Lab"} width={720} height={720}></Image>
							<Image className="h-14 w-fit py-4" src={"/assets/logos/formlabs.png"} alt={"Formlabs"} width={720} height={720}></Image>
							<Image className="h-14 w-fit py-2" src={"/assets/logos/onshape.png"} alt={"Onshape"} width={720} height={720}></Image>
							<Image className="h-14 w-fit py-2" src={"/assets/logos/blacktoerunning.png"} alt={"Black Toe Clothing"} width={720} height={720}></Image>
						</div>

					</HorizontalWrap>
				</div> */}
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
