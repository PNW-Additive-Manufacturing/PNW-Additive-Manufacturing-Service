import HorizontalWrap from "@/app/components/HorizontalWrap";
import RequestsTable from "@/app/components/RequestsTable";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import { Suspense } from "react";

export default async function Page() {
	
	return (
		<>
			<HorizontalWrap className="py-8 flex flex-col gap-4">
				<h1 className="w-fit text-3xl font-normal">
					Your Requests
				</h1>
				<p>
					All of your requests are available for you to view right here:
				</p>
			</HorizontalWrap>

			<div className="bg-white min-h-screen">

				<HorizontalWrap className="py-8">

					<Suspense>

						<Requests />

					</Suspense>

				</HorizontalWrap>

			</div>
		</>
	);
}

async function Requests()
{
	const session = await serveRequiredSession();

	return <>
	
		<RequestsTable session={session.account} requestsPerPage={10} />
	
	</>
}