import { RequestPartForm } from "@/app/components/RequestPartForm";
import Link from "next/link";
import { Suspense } from "react";
import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import ModelServe from "../Types/Model/ModelServe";
import { serveRequiredSession } from "../utils/SessionUtils";

export default async function Request() {

	return <>
		<HorizontalWrap>
			<div className="py-8">
				<h1 className="w-fit text-2xl font-normal mb-2">
					Fill out a Request
				</h1>
				<p>
					Utilizing our resources for rapid prototyping to final
					designs, we use top-notch consumer 3D Printers to ensure
					an outstanding result of your models. You can view our <Link className="underline" target="_blank" href={"/materials"}>materials we have on hand</Link> to choose the right process and material for your parts.
				</p>
			</div>
		</HorizontalWrap>

		<div className="bg-white min-h-screen">
			<HorizontalWrap className="py-8">
				<Suspense>
					<Dynamic />
				</Suspense>
			</HorizontalWrap>
		</div>
	</>
}

async function Dynamic() {

	const filaments = await FilamentServe.queryAll();
	const previousModels = await ModelServe.queryByAccount((await serveRequiredSession()).account.email);

	return <RequestPartForm
		filaments={filaments}
		previousUploadedModels={previousModels} />
}