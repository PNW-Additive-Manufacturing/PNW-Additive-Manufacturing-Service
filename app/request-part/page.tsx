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
				<div className="max-lg:px-4 mb-4">
					<h1 className="w-fit text-3xl font-normal mb-2">
						Fill out a Request
					</h1>
					<p>
						Utilizing our resources for rapid prototyping to final
						designs, we use top-notch consumer 3D Printers to ensure
						an outstanding result of your models. Choosing the right process and material is essential to ensure the part meets its functional, aesthetic, and durability requirements. You can view our <Link className="underline" target="_blank" href={"/materials"}>materials we have on hand</Link>.
					</p>
				</div>
				<br />
				<RequestPartForm
					filaments={filaments}
					previousUploadedModels={previousModels}></RequestPartForm>
			</HorizontalWrap>
		</>
	);
}
