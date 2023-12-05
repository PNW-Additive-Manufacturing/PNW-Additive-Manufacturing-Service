export interface Request {
    name: string,
    date: string,
    isFullfilled: boolean
}

function RequestRow({request}: {request: Request}): JSX.Element {
  return (
    <tr>
      <td className="text-left">{request.name}</td>
      <td className="text-left">{request.date}</td>
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