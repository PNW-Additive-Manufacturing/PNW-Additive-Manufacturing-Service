"use server";

import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import RequestPart from "./RequestPart";

export default async function Request() {
	const filaments = await FilamentServe.queryAll();

	return (
		<div className="bg-background min-h-screen">
			<HorizontalWrap className="py-8">
				<RequestPart filaments={filaments} />
			</HorizontalWrap>
		</div>
	);
}
