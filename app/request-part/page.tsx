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
			<HorizontalWrap className="">
				<div className="mb-6">
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
					<RequestPartForm
						filaments={filaments}
						previousUploadedModels={previousModels}></RequestPartForm>
				</HorizontalWrap>
			</div>
		</>
	);
}
