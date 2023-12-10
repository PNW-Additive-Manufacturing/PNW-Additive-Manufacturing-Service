import { RequestList } from '@/app/components/RequestList'
import { getRequests } from '@/app/api/util/GetRequests';
import { AccountDetails, ColorfulRequestPrintButton, Navbar } from '@/app/components/Navigation'
import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';
import { Request } from "@/app/api/util/Constants";
import Dropdown from "@/app/components/Dropdown";

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
			<Navbar
				links={[]}
				specialElements={<>
					<ColorfulRequestPrintButton/>
					<AccountDetails/>
				</>}
			/>

			<h1 className="w-full p-4 pt-1 pb-1 text-left">{`Welcome, ${name}!`}</h1>
					
			<div className='w-full xl:w-3/4 lg:mx-auto'>
				<Dropdown className="my-8" name="Pending Requests">
					<RequestList requests={pendingRequests} />
				</Dropdown>
				<Dropdown className="mb-8" name="Completed Requests">
					<RequestList requests={completedRequests} />
				</Dropdown>
			</div>
		</main>
	)
}
