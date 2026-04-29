"use server";

import HorizontalWrap from "../components/HorizontalWrap";
import FilamentServe from "../Types/Filament/FilamentServe";
import { queryActiveRegistrationSpan } from "../Types/RegistrationSpan/RegistrationSpanServe";
import { serveOptionalSession } from "../api/util/SessionHelper";
import RequestPart from "./RequestPart";
import { redirect } from "next/navigation";

export default async function Request() {
	const session = await serveOptionalSession();
	if (session && !session.isemailverified) {
		redirect("/user/not-verified");
	}

	const [filaments, activeSpan] = await Promise.all([
		FilamentServe.queryAll(),
		queryActiveRegistrationSpan(new Date()),
	]);

	const activeSpanData = activeSpan
		? { id: activeSpan.id, name: activeSpan.name, beginAt: activeSpan.beginAt.toISOString(), endAt: activeSpan.endAt.toISOString() }
		: null;

	return (
		<div className="bg-background min-h-screen">
			<HorizontalWrap className="py-8">
				<RequestPart filaments={filaments} activeSpan={activeSpanData} />
			</HorizontalWrap>
		</div>
	);
}
