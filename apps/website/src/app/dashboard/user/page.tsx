import { RequestList, Request } from '@/app/components/RequestList'
import { getRequests } from '@/app/api/util/GetRequests';
import { Navbar } from '@/app/components/Navigation'
import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';

export default async function Request() {
  let email: string;
  try {
    email = (await getJwtPayload())!.email;
  } catch(e) {
    return redirect("/user/login");
  }

  let resPendingRequest = await getRequests(email, false);
  let pendingRequests: Request[] = resPendingRequest.map((row: any) => {return {name: row.name, date: row.submittime, isFulfilled: row.isfulfilled}});

  let resCompletedRequest = await getRequests(email, true);
  let completedRequests: Request[] = resCompletedRequest.map((row: any) => {return {name: row.name, date: row.submittime, isFulfilled: row.isfulfilled}});

  return (
    <main>
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Logout", path: "/user/logout"}
      ]}/>

      <div className="bg-white rounded-sm p-14 w-full left">
        <h1 className="w-full pb-4 pt-0 text-left">Pending Requests</h1>
        <RequestList requests={pendingRequests}/>

        <h1 className="w-full pb-4 pt-10 text-left">Completed Requests</h1>
        <RequestList requests={completedRequests}/>
      </div>
    </main>
  )
}
