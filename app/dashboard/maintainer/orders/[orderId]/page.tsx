"use server";

import { RequestServe } from "@/app/Types/Request/RequestServe";
import RequestEditor from "./RequestEditor";
import AccountServe from "@/app/Types/Account/AccountServe";
import FilamentServe from "@/app/Types/Filament/FilamentServe";
import ErrorPrompt from "@/app/components/ErrorPrompt";
import { RequestWithEmails, RequestWithParts } from "@/app/Types/Request/Request";

export default async function Page(req: { params: { orderId: string } }) {
	let request = await RequestServe.fetchByIDWithAll(req.params.orderId);
	if (request == undefined) return <ErrorPrompt code={"404"} details={"Request does not exist!"}></ErrorPrompt>

	request = Object.assign(request, { emails: await RequestServe.getEmails(request.id) });

	const account = (await AccountServe.queryByEmail(request.requesterEmail))!;
	const availableFilaments = await FilamentServe.queryAll();

	return (
		<>
			<RequestEditor
				request={request as RequestWithParts & RequestWithEmails}
				requester={account}
				availableFilaments={availableFilaments}></RequestEditor>
		</>
	);
}
