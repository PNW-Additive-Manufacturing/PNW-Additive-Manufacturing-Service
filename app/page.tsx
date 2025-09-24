import { StaticImageData } from "next/image";
import HorizontalWrap from "./components/HorizontalWrap";
import Link from "next/link";
import { RegularArrowRight, RegularDiamondAlt } from "lineicons-react";
import ProjectSpotlightServe from "./Types/ProjectSpotlight/ProjectSpotlightServe";
import { ProjectCard } from "./project-spotlight/ProjectCard";
import { FaChevronRight } from "react-icons/fa6";
import AMImage from "./components/AMImage";

// Images

import Form3LImage from "@/public/assets/form_3l_helmet_hero.webp";
import Fuse30WImage from "@/public/assets/fuse1__transparent_productimage.png";
import Mars4UltraImage from "@/public/assets/Saturn-3-Ultra-12K-13.png";
import MetalXImage from "@/public/assets/Alfex_Markforged_Metal_X_3D_Printer_System.webp";
// import BambuLabX1CImage from "@/public/assets/Bambu Lab X1 Carbon_cover.png";
// import BambuLabX1EImage from "@/public/assets/Bambu Lab X1E_cover.png";
// import BambuLabP1SImage from "@/public/assets/Bambu Lab P1S_cover.png";
// import BambuLabA1Image from "@/public/assets/Bambu Lab A1_cover.png";
// import BambuLabA1MiniImage from "@/public/assets/Bambu Lab A1 mini_cover.png";
import BambuLabX1CImage from "@/public/assets/x1Series-main-bg-v1-sm.png";
import BambulabA1Image from "@/public/assets/Bambu_Lab_A1.webp";

import BambuLabIconImage from "@/public/assets/logos/bambulab.png";
import BlackToeRunningIconImage from "@/public/assets/logos/blacktoerunning.png";
import FormlabsIconImage from "@/public/assets/logos/formlabs.png";
import classNames from "classnames";

export default async function Home() {

	const showcases = await ProjectSpotlightServe.queryAllProjectShowcases();
	await ProjectSpotlightServe.withManyAttachments(showcases);

	return (
		<>
			<div>

				<HorizontalWrap className="my-14">
					<div className="xl:flex justify-center gap-10 lg:m-0 lg:text-center">
						<div className="w-fit mb-2 mt-2">
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
											Start Printing
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

				<div className="bg-white py-8 lg:py-12 lg:pt-0 shadow-sm">
					<HorizontalWrap>

						<h2 className="font-medium text-2xl pb-2 w-full text-center">See what <span className="font-bold">Students Created</span></h2>
						<p className="text-cool-black text-center">Students, faculty and professors bring ideas to reality using Additive Manufacturing.</p>

						<div className="flex flex-col gap-4 mt-8">

							<div className="grid grid-rows-1 max-md:grid-rows-12 md:grid-cols-5 lg:grid-cols-10 gap-4">

								{showcases.slice(0, Math.min(showcases.length, 3)).map((s, i) => <div key={s.id} className={`
									out
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

						{/* <hr className="my-12 opacity-50" /> */}
						<br />

						<h2 className="font-medium text-2xl pb-2 w-full mt-8 text-center"><span className="font-bold">Manufacturing Machines</span> in the Hammond Design Studio</h2>
						<p className="text-cool-black text-center">Each production method offers different benefits and drawbacks.</p>

						{/* <hr style={{ marginBottom: "0px" }} /> */}
						<div className="grid items-center grid-cols-2 md:grid-cols-4 xl:grid-cols-6 grid-rows-1 gap-6 mt-8 lg:gap-6">

							<ManufacturingMachineCard
								name={"Bambu Lab X1 Series"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabX1CImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab A1 Series"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambulabA1Image} />

							{/* <ManufacturingMachineCard
								name={"Bambu Lab X1E"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabX1EImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab P1S"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabP1SImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab A1"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabA1Image} />

							<ManufacturingMachineCard
								name={"Bambu Lab A1 Mini"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabA1MiniImage} /> */}

							<ManufacturingMachineCard
								name={"Markforged Metal X"}
								technology="Metal FFF"
								description={"A manufacturing solution that cost effectively prints parts using tool and stainless steel and other alloys"}
								imageSrc={MetalXImage} />

							<ManufacturingMachineCard
								name={"ELEGOO Mars 4 Ultra"}
								technology="Resin LCD"
								description={"Optimal for creating detailed and smooth-surfaced models, ideal for small intricate parts"}
								imageSrc={Mars4UltraImage} />

							<ManufacturingMachineCard
								name={"Formlabs Fuse 3L"}
								technology="Resin SLA"
								unavailableReason="Accepting Donations"
								description={"Resin trusted by professionals for fast turnaround of industrial quality"}
								imageSrc={Form3LImage} />

							<ManufacturingMachineCard
								name={"SLS Fuse 1+ 30W"}
								technology="Powder SLS"
								unavailableReason="Accepting Donations"
								description={"The Fuse 1+ 30W is a compact selective laser sintering 3D printer with an industrial punch, that brings truly rapid SLS 3D printing"}
								imageSrc={Fuse30WImage} />

						</div>
						{/* <div className="w-full lg:w-1/3 mt-4">
							<Link className="w-full" href="/materials">
								<button className="text-left flex justify-between" type="button">
									View our Materials and Processes
									<RegularDiamondAlt className="inline fill-white ml-2 mt-0.5" />
								</button>
							</Link>
						</div> */}
					</HorizontalWrap>
				</div>

				<div className="py-10 lg:py-12">
					<HorizontalWrap>

						<h2 className="text-xl font-medium mb-2">Our Sponsors</h2>
						<p>We are incredibly grateful to our sponsors and donators, whose generous support enables us to push the boundaries of Additive Manufacturing at Purdue Northwest.</p>
						<div className="flex gap-12 h-14 mt-8 overflow-x-scroll">
							<AMImage src={BlackToeRunningIconImage} alt={"Black Toe Clothing"} />
							{/* <AMImage src={BambuLabIconImage} alt={"Bambu Lab"} /> */}
							{/* <AMImage src={FormlabsIconImage} alt={"Formlabs"} /> */}
							{/* <AMImage className="h-14 w-fit py-2" src={"/assets/logos/onshape.png"} alt={"Onshape"} /> */}
						</div>

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

function ManufacturingMachineCard({ name, technology, description, unavailableReason, imageSrc }: { name: string, technology: string, description: string, imageSrc: StaticImageData, unavailableReason?: string }) {

	const isUnavailable = unavailableReason != null;

	return <div className={classNames("bg-white shadow-sm p-4 rounded-md out h-full", { "opacity-65": isUnavailable })}>
		<div className="w-full text-sm">
			<div className="px-4 w-full">
				<div className="aspect-square mb-4">
					<AMImage src={imageSrc} alt={name} quality={50} />
				</div>
			</div>
			<h2 className="text-lg font-semibold text-center">{name}</h2>
			<p className="mt-1.5 text-center">{unavailableReason ?? technology}</p>
			{/* <p className="mt-2 max-lg:hidden">{description}</p> */}
		</div>
	</div>

}