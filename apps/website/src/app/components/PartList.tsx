export interface Part {
    id: string,
    name: string,
    date: Date,
    status: string
}

function PartRow({part}: {part: Part}): JSX.Element {
  return (
    <tr>
      <td className="text-center">{part.id}</td>
      <td className="text-center">{part.name}</td>
      <td className="text-center">{part.date.toDateString()}</td>
      <td className="text-center">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border border-solid border-black border-collapse w-9/10">
      <thead>
        <tr>
          <th className="text-center">Part Id</th>
          <th className="text-center">Part Name</th>
          <th className="text-center">Date</th>
          <th className="text-center">Part Status</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((e) => <PartRow key={e.id} part={e} />)}
      </tbody>
    </table>
  )
}