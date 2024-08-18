"use server";

import Image from "next/image";
import HorizontalWrap from "../components/HorizontalWrap";

export default async function Home() {
	return (
		<main>
			<HorizontalWrap>
				<div className="px-4 lg:grid lg:grid-cols-2 grid-rows-2 grid-flow-col lg:grid-flow-row gap-6 m-auto lg:m-0 w-fit">
					Schedule has not been determined at this time. Visit the
					Design Studio in university-hours.
				</div>
			</HorizontalWrap>
		</main>
	);
}
