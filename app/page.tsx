import MetalXImage from "@/public/assets/Alfex_Markforged_Metal_X_3D_Printer_System.webp";
import BambulabA1Image from "@/public/assets/Bambu_Lab_A1.webp";
// import Form3LImage from "@/public/assets/form_3l_helmet_hero.webp";
// import Fuse30WImage from "@/public/assets/fuse1__transparent_productimage.png";
import Mars4UltraImage from "@/public/assets/Saturn-3-Ultra-12K-13.png";
import BambuLabX1EImage from "@/public/assets/x1e-footer-1f77ba7f687a5.png";
import BambuLabX1CImage from "@/public/assets/x1Series-main-bg-v1-sm.png";
import classNames from "classnames";
import { cacheLife, cacheTag } from "next/cache";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FaArrowRight } from "react-icons/fa";
import { amImageIconLightTransparent } from "./Branding";
import AMImage from "./components/AMImage";
import HorizontalWrap from "./components/HorizontalWrap";
import { ProjectCard } from "./project-spotlight/ProjectCard";
import ProjectSpotlightServe from "./Types/ProjectSpotlight/ProjectSpotlightServe";

export default async function Home() {
	return (
		<>
			<div className="bg-white">

				<div className="bg-background shadow-sm">

					<HorizontalWrap className="py-20">
						<div className="flex gap-10 lg:m-0 justify-between items-center max-lg:text-center max-lg:w-full">
							<div className="w-fit mb-2 mt-2">
								<h1 className="mb-4 text-3xl font-normal">
									<span className="font-bold">
										<span className="text-pnw-gold"> PNW </span>
										Additive Manufacturing Service
									</span>
								</h1>

								<p
									className="overflow-hidden full pb-4 max-lg:w-full w-[600px]">
									<span className="text-pnw-gold">Created by the PNW Additive Manufacturing Club</span>,
									this service enables PNW students, and faculty
									members to explore the world of 3D Printing.
								</p>

								{/* <ul style={{ maxWidth: "600px" }}>
								<li>Utilize rapid prototyping to create custom connectors and mounts.</li>
								<li>Produce creative models, prosthetics, and more with 3D Printing solutions.</li>
								<li>Guidance in designing or optimizing models for 3D Printing using <Link className="underline" target="_blank" href={"https://www.onshape.com/en/"}>Onshape</Link>.</li>
							</ul> */}

								<div className="pt-2 lg:pt-6 w-fit max-lg:mx-auto">
									<div className="flex flex-wrap items-center gap-4">
										<Link href={"/request-part"}>
											<button className="w-fit px-3.5 py-2.5 mb-0 text-sm bg-white outline-2 text-pnw-gold fill-pnw-gold outline outline-pnw-gold tracking-wider font-bold uppercase shadow-sm">
												Start Printing
												<FaArrowRight className="inline ml-2 mb-0.5" />
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
											className="block w-fit tracking-wider max-sm:hidden font-light text-sm">
											Join MyPNW Life
										</a>
									</div>


								</div>
							</div>

							{/* <AMSIcon/> */}

							<Image
								loading="eager"
								src={amImageIconLightTransparent}
								alt="Logo"
								className="w-44 h-fit hidden lg:block" />

							{/* <div className="mb-6">
							<video src={"/assets/Timeline 1.mp4"} className="max-2xl:hidden rounded-md ml-auto" style={{ maxHeight: "17.5rem" }} controls muted={true} loop={true} preload={"none"} playsInline={true} poster="/assets/lab_setup_1.jpg" />
						</div> */}
						</div>
					</HorizontalWrap>

				</div>

				<svg className="shadow-lg" viewBox="0 0 100 2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
					<path className="fill-background" d="M100,0 100,2 0,0 Z" />
				</svg>

				<div className="py-12 bg-white">
					<HorizontalWrap>

						<h2 className="font-semibold text-2xl pb-2 w-full max-lg:text-center">Manufacturing Machines</h2>
						<div className="text-cool-black max-lg:text-center max-md:hidden">
							Each production method offers different benefits and drawbacks. We recommend taking a look at an excellent guide by{" "}

							<a className="underline" target="_blank" href="https://xometry.pro/en-eu/articles/3d-printing-sla-vs-fdm/">
								Xometry (3D Comparisons)
							</a>.
						</div>

						<div className="grid items-center grid-cols-2 md:grid-cols-4 xl:grid-cols-6 grid-rows-1 gap-6 mt-8 lg:gap-6">

							<ManufacturingMachineCard
								name={"Markforged Metal X"}
								technology="Metal Fused Filament Fabrication"
								description={"A manufacturing solution that cost effectively prints parts using tool and stainless steel and other alloys"}
								imageSrc={MetalXImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab X1C"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambuLabX1CImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab X1E"}
								technology="Fused Deposition Modeling"
								description={"A cost-effective solution to engineering high-strength parts."}
								imageSrc={BambuLabX1EImage} />

							<ManufacturingMachineCard
								name={"Bambu Lab A1"}
								technology="Fused Deposition Modeling"
								description={"Perfect for prototyping medium-strength parts, offering a cost-effective solution for functional prototypes and design testing"}
								imageSrc={BambulabA1Image} />

							<ManufacturingMachineCard
								name={"ELEGOO Mars 4U"}
								technology="Resin LCD"
								description={"Optimal for creating detailed and smooth-surfaced models, ideal for small intricate parts"}
								imageSrc={Mars4UltraImage} />

							{/* <ManufacturingMachineCard
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
								imageSrc={Fuse30WImage} /> */}

						</div>

						{/* <p>
							Interested in learning 3D printing or using our machines?
							You can submit a request through our online form, or visit the
							<a
								className="underline"
								href="https://www.pnw.edu/engineering/student-resources/student-engineering-design-studio/">
								Design Studio
							</a>
							during worker hours for assistance, training, and access to equipment.
						</p> */}


					</HorizontalWrap>
				</div>

				<Suspense>

					{/* <svg className="bg-background" viewBox="0 0 100 2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
						<path className="fill-white" d="M100,0 100,2 0,0 Z" />
					</svg> */}

					<EngineeringSpotlight />

					{/* <svg className="shadow-lg" viewBox="0 0 100 2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
						<path className="fill-background" d="M100,0 100,2 0,0 Z" />
					</svg> */}

				</Suspense>

				{/* <div className="py-12 bg-black">

					<HorizontalWrap>

						<h2 className="text-xl font-medium mb-2">Sponsors</h2>
						<p>We are incredibly grateful to our sponsors and donators, whose generous support enables us to push the boundaries of Additive Manufacturing at Purdue Northwest.</p>
						<div className="flex gap-12 h-14 mt-8 overflow-x-scroll">
							<AMImage src={OnshapeIconImage} alt={"Onshape"} />
							<AMImage src={BlackToeRunningIconImage} alt={"Black Toe Clothing"} />
							<AMImage src={BambuLabIconImage} alt={"Bambu Lab"} />
							<AMImage src={FormlabsIconImage} alt={"Formlabs"} />
						</div>

					</HorizontalWrap>

				</div> */}
			</div >
		</>
	);
}

async function EngineeringSpotlight() {
	"use cache"
	cacheLife("hours");
	cacheTag("project-spotlight");

	const showcases = await ProjectSpotlightServe.queryAllProjectShowcases();
	await ProjectSpotlightServe.withManyAttachments(showcases);

	if (showcases.length === 0) return <></>;

	return <>

		<HorizontalWrap>
			<div className="w-1/2 mx-auto">
				<hr />
			</div>
		</HorizontalWrap>

		<div className="py-12 pb-20">
			<HorizontalWrap>

				<h2 className="font-semibold text-2xl pb-2 w-full text-right">Engineering Spotlight</h2>
				<p className="text-cool-black text-right">Students bring ideas to reality using on-campus Manufacturing.</p>

				{/* <div className="flex gap-8 w-full mt-12"> */}

					{/* {showcases.slice(0, 5).map(s => <div key={s.id} className="flex gap-2 relative">

						<div className="w-full bg-gray-100 ml-4 rounded-md p-4 z-10 mt-52 shadow-sm">

							<p className="font-semibold mb-1.5">{s.title}</p>
							<p className="text-wrap"><span className="text-nowrap">{s.author}</span></p>

						</div>

						<div className="w-full pr-4 absolute aspect-square top-0">
							<Image key={s.id} className="object-cover w-full h-full rounded-lg bg-background out shadow-sm" src={`/api/download/project-showcase-image/?projectId=${s.id}`} alt={""} width={480} height={480} />
						</div>

					</div>)} */}

					{/* <div className="w-1/3 aspect-square bg-purple-400"></div>

					<div className="w-1/3">

						<div className="bg-orange-400 w-full mb-4 h-16" />
						<div className="bg-orange-400 w-full mb-4 h-8" />

						<div className="bg-orange-400 w-full h-60" />

					</div>

					<div className="w-1/3 aspect-square bg-purple-400"></div>

					<div className="w-1/3">

						<div className="bg-orange-400 w-full mb-4 h-16" />
						<div className="bg-orange-400 w-full mb-4 h-8" />

						<div className="bg-orange-400 w-full h-60" />

					</div> */}


				{/* </div> */}

				{/* <div className="mx-auto w-fit flex gap-2 p-3 rounded-xl bg-white mt-6">

					<div className="w-2.5 h-2.5 rounded-full hover:bg-gray-400 bg-gray-300" />
					<div className="w-2.5 h-2.5 rounded-full hover:bg-gray-400 bg-gray-300" />
					<div className="w-2.5 h-2.5 rounded-full hover:bg-gray-400 bg-gray-300" />
					<div className="w-2.5 h-2.5 rounded-full hover:bg-gray-400 bg-gray-300" />
					<div className="w-2.5 h-2.5 rounded-full hover:bg-gray-400 bg-gray-300" />

				</div> */}

				<div className="grid lg:grid-cols-2 2xl:grid-cols-4 gap-8 mt-12">

						{showcases.slice(0, Math.min(showcases.length, 8)).map((s, i) => <div className="bg-background" key={s.id}>

							<ProjectCard projectData={s} editable={false} key={s.id} style={"normal"} />

						</div>)}

				</div>

				{/* <br /> */}

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

	</>
}

function ManufacturingMachineCard({ name, technology, description, unavailableReason, imageSrc }: { name: string, technology: string, description: string, imageSrc: StaticImageData, unavailableReason?: string }) {

	const isUnavailable = unavailableReason != null;

	return <div className={classNames("p-4 rounded-md h-full", { "opacity-65": isUnavailable })}>
		<div className="w-full text-sm">
			<div className="px-4 w-full">
				<div className="aspect-square w-full mb-4">
					<AMImage src={imageSrc} className="" alt={name} />
				</div>
			</div>
			<h2 className="text-lg font-semibold text-center">{name}</h2>
			<p className="mt-1.5 text-center">{unavailableReason ?? technology}</p>
			{/* <p className="mt-2 max-lg:hidden">{description}</p> */}
		</div>
	</div>

}