"use server";

import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import FilamentBlock from "./FilamentBlock";
import PopupFilamentSelector from "../components/PopupFilamentSelector";
import SendTestEmailForm from "./SendTestEmailForm";
import DateTest from "./DateTest";

export default async function Page() {
	const availableFilaments = await FilamentServe.queryAll();

	return (
		<HorizontalWrap>
			<h1 className="text-2xl">AMS Experiments</h1>
			<br />

			<DateTest></DateTest>

			{/* <Farm availableFilaments={availableFilaments} /> */}

			<h2 className="text-lg my-4">Enhanced Filament Selector</h2>
			<PopupFilamentSelector filaments={availableFilaments} />
			<hr />

			<h2 className="text-lg my-4">Filament Block Swatch</h2>
			{availableFilaments.map((filament) => (
				<div className="mb-2">
					<FilamentBlock filament={filament} />
				</div>
			))}

			<h2 className="text-lg my-4">Email Tester</h2>
			<SendTestEmailForm></SendTestEmailForm>
		</HorizontalWrap>
	);
}
