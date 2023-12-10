import { Part } from "@/app/api/util/Constants";

async function PartRow({part}: {part: Part}): Promise<JSX.Element> {
  return (
    <tr className="text-left h-11">
      <td className="w-1/2 py-1.5">{part.modelname}</td>
      <td className="w-1/6 py-1.5">{part.filamentcolor} {part.filamentmaterial}</td>
      <td className="w-1/6 py-1.5">{part.quantity}</td>
      <td className="w-1/6 py-1.5">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <tbody>
        {parts.map((e) => <PartRow key={e.requestid} part={e} />)}
      </tbody>
    </table>
  )
}