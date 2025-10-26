import HorizontalWrap from "@/app/components/HorizontalWrap";
import getConfig from "@/app/getConfig";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import RequestDetails from "./RequestDetails";

export default async function Page(props: {
    params: Promise<{ id: number | string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    return <>

		<HorizontalWrap className="py-8">
			
			<Suspense>

				<Requests params={props.params} searchParams={props.searchParams} />

			</Suspense>

		</HorizontalWrap>

	</>;
}

const appConfig = getConfig();

async function Requests(props: {
    params: Promise<{ id: number | string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

	const searchParams = await props.searchParams;
    const params = await props.params;

	    const request = await RequestServe.fetchByIDWithAll(params.id);
    if (request == undefined) {
		redirect("/not-found");
	}

    if ("trackingId" in searchParams && searchParams["trackingId"] != null) {
		// We have a tracking ID supplied, attempt to query the associated email!
		await RequestServe.seenEmail(searchParams["trackingId"] as string);

		// Redirect to the same URL without the tracking information.
		redirect(`${appConfig.hostURL}/dashboard/user/${params.id}`);
	}

	return <>

		<RequestDetails request={request} />
	
	</>
}