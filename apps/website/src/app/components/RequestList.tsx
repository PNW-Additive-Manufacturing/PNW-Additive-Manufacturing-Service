import { PartList, Part } from '@/app/components/PartList';
import { getParts } from '@/app/api/util/GetParts';

export interface Request {
    id: number,
    name: string,
    date: Date,
    isFulfilled: boolean
}

async function RequestRow({request}: {request: Request}): Promise<JSX.Element> {
  let resPart = await getParts(request.id);
  let parts: Part[] = resPart.map((row: any) => {return {id: row.id, requestid: row.requestid, modelid: row.modelid, quantity: row.quantity, status: row.status}});
  
  return (
    <tr className="text-left">
      <td className="">{request.name}<br/>{request.date.toLocaleDateString()}<br/>{request.date.toLocaleTimeString()}</td>
      <td className=""><PartList parts={parts}/></td>
    </tr>
  )
}

export function RequestList({requests}: {requests: Request[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="">Request</th>
          <th className="">Parts</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((e) => <RequestRow key={e.name} request={e} />)}
      </tbody>
    </table>
  )
}