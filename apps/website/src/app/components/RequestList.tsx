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
  let parts: Part[] = resPart.map((row: any) => {return {id: row.id, requestid: row.requestid, modelid: row.modelid, quantity: row.quantity, status: row.status, filament: row.filament}});
  
  const options = {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };

  return (
    <tr className="text-left">
      <td className="w-1/4 p-2">{request.name}<br/>{request.date.toLocaleString("en-US", options)}</td>
      <td className="p-2"><PartList parts={parts}/></td>
    </tr>
  )
}

export function RequestList({requests}: {requests: Request[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="w-1/4">Request</th>
          <th className="flex">
            <th className="w-1/2">Part Name</th>
            <th className="w-1/6">Filament</th>
            <th className="w-1/6">Quantity</th>
            <th className="w-1/6">Status</th>
          </th>
        </tr>
      </thead>
      <tbody>
        {requests.map((e) => <RequestRow key={e.name} request={e} />)}
      </tbody>
    </table>
  )
}