export interface Request {
    name: string,
    date: Date,
    isFulfilled: boolean
}

function RequestRow({request}: {request: Request}): JSX.Element {
  console.log(request);
  return (
    <tr>
      <td className="text-left">{request.name}</td>
      <td className="text-left">{request.date.toLocaleString()}</td>
    </tr>
  )
}

export function RequestList({requests}: {requests: Request[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border border-solid border-black border-collapse w-full">
      <thead>
        <tr>
          <th className="text-left">Request Name</th>
          <th className="text-left">Date Submitted</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((e) => <RequestRow key={e.name} request={e} />)}
      </tbody>
    </table>
  )
}