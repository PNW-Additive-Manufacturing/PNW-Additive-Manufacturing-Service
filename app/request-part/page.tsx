"use server";

import { RequestPartForm } from "@/app/components/RequestPartForm";
import { getFilamentList } from "@/app/api/server-actions/request-part";
import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import ModelServe from "../Types/Model/ModelServe";
import { getJwtPayload } from "../api/util/JwtHelper";
import Filament from "../Types/Filament/Filament";
import Link from "next/link";

export default async function Request() {
	let filaments = await FilamentServe.queryAll();
	const previousModels = await ModelServe.queryByAccount(
		(await getJwtPayload())!.email
	);

	return (
		<>
			<HorizontalWrap>
				<div className="max-lg:px-4 mb-6">
					<h1 className="w-fit text-2xl font-normal mb-2">
						Fill out a Request
					</h1>
					<p>
						Utilizing our resources for rapid prototyping to final
						designs, we use top-notch consumer 3D Printers to ensure
						an outstanding result of your models. You can view our <Link className="underline" target="_blank" href={"/materials"}>materials we have on hand</Link> to choose the right process and material for your parts.
					</p>
					<ul className="mt-3 text-sm">
						<li>Uploaded models must adhere to <Link className="underline" href={"https://formlabs.com/blog/design-for-manufacturing-with-3d-printing/"} target="_blank">3D Printing Design for Manufacturing (DFM) principles</Link>; otherwise, they may be deemed unprintable.</li>
						<li>Submissions must not contain NSFW content, including weapons or inappropriate material and are prohibited from being resold individually.</li>
						<li>Uploaded models will be stored securely until the end of the academic year.</li>
						<li>Refunds must be processed in-person and require a valid reason other than design errors.</li>
					</ul>
				</div>
				<RequestPartForm
					filaments={filaments}
					previousUploadedModels={previousModels}></RequestPartForm>
			</HorizontalWrap>
		</>
	);
}
