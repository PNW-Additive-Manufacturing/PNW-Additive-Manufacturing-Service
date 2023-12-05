export interface Part {
    id: number,
    requestid: number,
    modelid: number,
    quantity: number,
    status: string
}

function PartRow({part}: {part: Part}): JSX.Element {
  console.log(part);
  return (
    <tr>
      <td className="text-left">{part.id}</td>
      <td className="text-left">{part.requestid}</td>
      <td className="text-left">{part.modelid}</td>
      <td className="text-left">{part.quantity}</td>
      <td className="text-left">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border border-solid border-black border-collapse w-full">
      <thead>
        <tr>
          <th className="text-left">Part ID</th>
          <th className="text-left">Request ID</th>
          <th className="text-left">Model ID</th>
          <th className="text-left">Quantity</th>
          <th className="text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((e) => <PartRow key={e.id} part={e} />)}
      </tbody>
    </table>
  )
}