import { RequestList, Request } from '@/app/components/RequestList'
import { getRequests } from '@/app/api/util/GetRequests';
import { Navbar } from '@/app/components/Navigation'

export default async function Request() {

  let resPendingRequest = await getRequests('dhollema@pnw.edu', false);
  let pendingRequests: Request[] = resPendingRequest.map((row: any) => {return {name: row.name, date: row.date, isFullfilled: row.isFullfilled}});

  let resCompletedRequest = await getRequests('dhollema@pnw.edu', true);
  let completedRequests: Request[] = resCompletedRequest.map((row: any) => {return {name: row.name, date: row.date, isFullfilled: row.isFullfilled}});

  return (
    <main>      
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Logout", path: "/logout"}
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
