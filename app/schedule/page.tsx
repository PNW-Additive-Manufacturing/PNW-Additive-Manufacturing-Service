"use server";

import Image from "next/image";
import HorizontalWrap from "../components/HorizontalWrap";

export default async function Home() {
	return (
		<main>
			<HorizontalWrap>
				Schedule has not been determined at this time. Visit the Design
				Studio in university-hours from 12-5 PM.
			</HorizontalWrap>
		</main>
	);
}
