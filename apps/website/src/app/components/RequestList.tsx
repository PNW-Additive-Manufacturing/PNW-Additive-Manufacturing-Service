import { PartList } from '@/app/components/PartList';
import { getParts } from '@/app/api/util/GetParts';

export interface Request {
    name: string,
    date: Date,
    isFulfilled: boolean
}

function RequestRow({request}: {request: Request}): JSX.Element {
  console.log(request);
  return (
    <tr>
      <td className="text-left">{request.name}<br/>{request.date.toLocaleDateString()}<br/>{request.date.toLocaleTimeString()}</td>
      <td className="text-left">
        
      </td>
    </tr>
  )
}

export function RequestList({requests}: {requests: Request[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border border-solid border-black border-collapse w-full">
      <thead>
        <tr>
          <th className="text-left">Request</th>
          <th className="text-left">Parts</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((e) => <RequestRow key={e.name} request={e} />)}
      </tbody>
    </table>
  )
}