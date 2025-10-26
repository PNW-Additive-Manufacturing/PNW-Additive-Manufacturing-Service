import HorizontalWrap from "@/app/components/HorizontalWrap";
import RequestsTable from "@/app/components/RequestsTable";
import { AccountPermission } from "@/app/Types/Account/Account";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import { Suspense } from "react";

export default async function Page({ params }: { params: any }) {

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

async function Dynamic()
{
	// Auth Check
	const session = await serveRequiredSession({ requiredPermission: AccountPermission.Maintainer });

	return <>
	
		<RequestsTable requestsPerPage={15} session={session.account} />
	
	</>
}