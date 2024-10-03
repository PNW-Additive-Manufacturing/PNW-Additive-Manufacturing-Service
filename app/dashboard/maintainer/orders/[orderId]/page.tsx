"use server";

import { RequestServe } from "@/app/Types/Request/RequestServe";
import RequestEditor from "./RequestEditor";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";

export default async function Page(req: { params: { orderId: string } }) {
	const request = await RequestServe.fetchByIDWithAll(req.params.orderId);
	if (request == undefined) {
		return <>That request does not exist!</>;
	}

	const account = (await AccountServe.queryByEmail(request.requesterEmail))!;
	const availableFilaments = await FilamentServe.queryAll();

	return (
		<>
			<RequestEditor
				request={request}
				requester={account}
				availableFilaments={availableFilaments}></RequestEditor>
		</>
	);
}
