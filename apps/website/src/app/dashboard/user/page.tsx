import { RequestList } from '@/app/components/RequestList'
import { getRequests } from '@/app/api/util/GetRequests';
import { Navbar } from '@/app/components/Navigation'
import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';
import { Request } from "@/app/api/util/Constants";

export default async function Request() {
  let email: string;
  let name: string;
  try {
    let payload = (await getJwtPayload())!;
    email = payload.email;
    name = payload.firstname + " " + payload.lastname;
  } catch(e) {
    return redirect("/user/login");
  }

  let resPendingRequest = await getRequests(email, false);
  let pendingRequests: Request[] = resPendingRequest.map((row: any) => {return {id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled}});

  let resCompletedRequest = await getRequests(email, true);
  let completedRequests: Request[] = resCompletedRequest.map((row: any) => {return {id: row.id, name: row.name, date: row.submittime, isFulfilled: row.isfulfilled}});

  return (
    <main>
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Logout", path: "/user/logout"}
      ]}/>

      <h1 className="w-full p-4 pt-1 pb-1 text-left">{`Welcome, ${name}!`}</h1>

      <div className="bg-white rounded-sm p-14 pt-7 w-full left">
        <h1 className="w-full pb-4 pt-0 text-left">Pending Requests</h1>
        <RequestList requests={pendingRequests}/>

        <h1 className="w-full pb-4 pt-10 text-left">Completed Requests</h1>
        <RequestList requests={completedRequests}/>
      </div>
    </main>
  )
}
