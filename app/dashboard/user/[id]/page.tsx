import Section from "@/app/components/Section";
import RequestDetails from "./RequestDetails";
import AccountServe from "@/app/Types/Account/AccountServe";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { redirect } from "next/navigation";

export default async function Page({
	params
}: {
	params: { id: number | string };
}) {
	const request = await RequestServe.fetchByIDWithAll(params.id);
	if (request == undefined) {
		redirect("/not-found");
	}

	// TODO: Authorization required!

	return <RequestDetails request={request}></RequestDetails>;
}
