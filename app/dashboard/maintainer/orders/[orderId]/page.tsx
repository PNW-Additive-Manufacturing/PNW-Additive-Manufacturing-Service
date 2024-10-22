"use server";

import { RequestServe } from "@/app/Types/Request/RequestServe";
import RequestEditor from "./RequestEditor";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import ErrorPrompt from "@/app/components/ErrorPrompt";

export default async function Page(req: { params: { orderId: string } }) {
	const request = await RequestServe.fetchByIDWithAll(req.params.orderId);
	if (request == undefined) return <ErrorPrompt code={"404"} details={"Request does not exist!"}></ErrorPrompt>

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
