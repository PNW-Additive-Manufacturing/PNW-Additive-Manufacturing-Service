import HorizontalWrap from "@/app/components/HorizontalWrap";
import { AccountPermission } from "@/app/Types/Account/Account";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { FilamentList } from "./FilamentTable";

export default async function Page() {

	unstable_noStore();

	return (
		<>
			<Suspense>

				<HorizontalWrap>
					<div className="py-8 flex flex-col gap-4">
						<h1 className="w-fit text-3xl font-normal">
							Inventory
						</h1>
						<p className="text-gray-600">
							View Filaments and Materials.
						</p>
					</div>
				</HorizontalWrap>

				<div className="bg-white min-h-screen py-8">
					<HorizontalWrap>


						<Dynamic />


					</HorizontalWrap>

				</div>

			</Suspense>
		</>
	);
}

export async function Dynamic() {

	// Auth Check
	await serveRequiredSession({ requiredPermission: AccountPermission.Maintainer });

	const filaments = await FilamentServe.queryAll();

	return <FilamentList initialFilaments={filaments} />

}