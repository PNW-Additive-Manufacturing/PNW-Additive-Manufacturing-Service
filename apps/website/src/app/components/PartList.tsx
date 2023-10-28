export interface Part {
    id: string,
    name: string,
    date: Date,
    status: string
}

function PartRow({part}: {part: Part}): JSX.Element {
  return (
    <tr>
      <td className="border border-slate-700 text-center">{part.id}</td>
      <td className="border border-slate-700 text-center">{part.name}</td>
      <td className="border border-slate-700 text-center">{part.date.toDateString()}</td>
      <td className="border border-slate-700 text-center">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border-collapse border border-slate-500 w-9/10">
      <tbody>
          <tr>
              <td className="border border-slate-700 text-center">Part Id</td>
              <td className="border border-slate-700 text-center">Part Name</td>
              <td className="border border-slate-700 text-center">Date</td>
              <td className="border border-slate-700 text-center">Part Status</td>
          </tr>
          {parts.map((e) => <PartRow key={e.id} part={e} />)}
      </tbody>
    </table>
  )
}