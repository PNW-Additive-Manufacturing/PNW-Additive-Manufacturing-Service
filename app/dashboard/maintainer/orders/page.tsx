import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Suspense } from "react";
import Dynamic from "./Dynamic";

export default async function Maintainer({ params }: { params: any }) {

	return (
		<>
			<HorizontalWrap className="py-8 flex flex-col gap-4">
				<h1 className="w-fit text-3xl font-normal">
					Request Management
				</h1>
			</HorizontalWrap>

			<div className="bg-white min-h-screen">
				<HorizontalWrap className="py-8">

					<Suspense>

						<Dynamic />

					</Suspense>

				</HorizontalWrap>

			</div>
		</>
	);
}
