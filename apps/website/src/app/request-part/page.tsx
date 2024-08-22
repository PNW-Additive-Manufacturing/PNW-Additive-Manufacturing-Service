"use server";

import { RequestPartForm } from "@/app/components/RequestPartForm";
import { getFilamentList } from "@/app/api/server-actions/request-part";
import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import ModelServe from "../Types/Model/ModelServe";
import { getJwtPayload } from "../api/util/JwtHelper";
import Filament from "../Types/Filament/Filament";
import Link from "next/link";

/*
    This MUST be a server component to work because the FilamentSelector is a client side component
    that needs the filement list from a Server Action, which can only be retrieved 
    asyncronously when using a Server Component.

    Client Components cannot render Server Components unless the server component is passed as a prop.

    Note that Client Components CANNOT render async Server Components, even if the async Server
    Component is passed as a prop.
*/

export default async function Request() {
	let filaments = await FilamentServe.queryAll();
	const previousModels = await ModelServe.queryByAccount(
		(await getJwtPayload())!.email
	);

	return (
		<>
			<HorizontalWrap>
				<div className="max-lg:px-4">
					<h1 className="text-3xl tracking-wide font-light my-4">
						Fill out a Request
					</h1>
					<p className="mb-4">
						Utilizing our resources for rapid prototyping to final
						designs, we use top-notch consumer 3D Printers to ensure
						an outstanding result of your models.
					</p>
					<span>Looking for something? Check out </span>
					<a
						className="underline"
						href="https://www.printables.com/"
						target="_blank">
						Printables
					</a>
					{" & "}
					<a
						className="underline"
						href="https://makerworld.com/"
						target="_blank">
						Makerworld
					</a>
					!
				</div>
				<br />
				<RequestPartForm
					filaments={filaments}
					previousUploadedModels={previousModels}></RequestPartForm>
			</HorizontalWrap>
		</>
	);
}
