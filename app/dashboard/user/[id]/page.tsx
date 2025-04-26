import Section from "@/app/components/Section";
import AccountServe from "@/app/Types/Account/AccountServe";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { redirect } from "next/navigation";
import RequestDetails from "./RequestDetails";
import getConfig from "@/app/getConfig";
import HorizontalWrap from "@/app/components/HorizontalWrap";

const appConfig = getConfig();

export default async function Page({ params, searchParams }: {
	params: { id: number | string },
	searchParams: { [key: string]: string | string[] | undefined }
}) {
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

		<HorizontalWrap className="py-8">
			<RequestDetails request={request} />
		</HorizontalWrap>

	</>;
}
