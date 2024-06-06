import { RequestList } from '@/app/components/RequestList'
import { getRequestsBy } from '@/app/api/util/GetRequests';
import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';
import { Request } from "@/app/api/util/Constants";
import DropdownSection from "@/app/components/DropdownSection";
import { getParts } from '@/app/api/util/GetParts';
import { RegularArrowUpCircle, RegularPopup } from 'lineicons-react';

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

	const pendingRequests = await getRequestsBy(email);

	// let resPendingRequest = await getRequests(email, false);
	// let pendingRequests: Order[] = resPendingRequest.map((row: any) => { return { id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled } });

	// let resCompletedRequest = await getRequests(email, true);
	// let completedRequests: Order[] = resCompletedRequest.map((row: any) => { return { id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled } });

	return <>
		<h1 className='text-3xl tracking-wide font-light float-right'>Welcome, {name}.</h1>

		<br className='my-4'/>

		<h2 className='text-xl tracking-wide font-light my-4'>Requests pending Review</h2>
		<div className='rounded-md my-2 p-4 w-full bg-white'>
			<p className='my-2 w-fit mx-auto'>You do not have any pending requests.</p>
		</div>

		<br/>

		<h2 className='text-xl tracking-wide font-light my-4'>Quotes pending Payment</h2>
		<div className='rounded-md my-2 p-4 w-full bg-white'>
			<p className='my-2 w-fit mx-auto'>You do not have any quotes pending payment.</p>
		</div>

		<br/>

		<h2 className='text-xl tracking-wide font-light my-4'>Ongoing Orders</h2>
		<div className='block w-full rounded-md overflow-y-scroll' style={{maxHeight: "620px"}}>
			<div>
				{pendingRequests.map(async req => {
					let parts = await getParts(req.id);
					let partsCompleted = parts.filter(p => p.status == "printed");
					// Approval should be done on the order itself? Not the Parts.
					let isWaitingForApproval = parts.every(p => p.status == "pending");
					// let isDenied = parts.find(p => p.status == "denied") != null;

					return <>
						<div className='rounded-md my-2 p-4 bg-white hover:bg-slate-100 hover:cursor-pointer'>
							<div className='float-right'>
							</div>
							<div className='inline'>
								<div className='text-lg mr-2'>{req.name}</div>
								<div className={`inline-block w-3 h-3 rounded-full mr-2 ${req.isFulfilled ? 'bg-green-700' : parts.length == partsCompleted.length ? 'bg-purple-800' : isWaitingForApproval ? 'bg-gray-500' : 'bg-orange-500'}`}></div>
								<div className={`inline-block uppercase text-sm rounded-sm py-2 mr-2 ${req.isFulfilled ? 'text-green-700' : parts.length == partsCompleted.length ? 'text-purple-800' : isWaitingForApproval ? 'text-gray-500' : 'text-orange-500'}`}>
									{req.isFulfilled ? 'Fulfilled' : parts.length == partsCompleted.length ? 'Waiting for Pickup' : isWaitingForApproval ? 'Waiting for Approval' : 'Printing'}
								</div>
								<br></br>
								<RegularArrowUpCircle className='w-3 h-3 fill-gray-400 inline mr-1.5'></RegularArrowUpCircle>
								<span className='text-sm'>{req.submittime.toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</span>
							</div>
						</div>
					</>
				})}
			</div>
		</div>

		<br/>
		<h2 className='text-xl tracking-wide font-light my-4'>Fulfilled Orders</h2>
		<div className='rounded-md my-2 p-4 w-full bg-white'>
			<p className='my-2 w-fit mx-auto'>You do not have any fulfilled orders.</p>
		</div>
	</>
}