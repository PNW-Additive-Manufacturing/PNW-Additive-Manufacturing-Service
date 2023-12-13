import { RequestList } from '@/app/components/RequestList'
import { getRequests } from '@/app/api/util/GetRequests';
import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';
import { Request } from "@/app/api/util/Constants";
import DropdownSection from "@/app/components/DropdownSection";

export default async function Request() {
	let email: string;
	let name: string;
	try {
		let payload = (await getJwtPayload())!;
		email = payload.email;
		name = payload.firstname + " " + payload.lastname;
	} catch (e) {
		return redirect("/user/login");
	}

	let resPendingRequest = await getRequests(email, false);
	let pendingRequests: Request[] = resPendingRequest.map((row: any) => { return { id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled } });

	let resCompletedRequest = await getRequests(email, true);
	let completedRequests: Request[] = resCompletedRequest.map((row: any) => { return { id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled } });

	return (
		<main>
			<div>
				{/* Possibly show little bits of information of the user here? */}
				<div className="text-2xl md:text-3xl mb-10">Welcome, {name}!</div>
			</div>

			<DropdownSection className="my-8" name="Pending Requests">
				<RequestList requests={pendingRequests} />
			</DropdownSection>
			
			<DropdownSection className="mb-8" name="Completed Requests">
				<RequestList requests={completedRequests} />
			</DropdownSection>
		</main>
	)
}