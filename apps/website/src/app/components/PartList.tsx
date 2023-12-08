import { Part } from "@/app/api/util/Constants";

async function PartRow({part}: {part: Part}): Promise<JSX.Element> {
  return (
    <tr className="text-left">
      <td className="w-1/2 p-2">{part.modelname}</td>
      <td className="w-1/6 p-2">{part.filamentcolor} {part.filamentmaterial}</td>
      <td className="w-1/6 p-2">{part.quantity}</td>
      <td className="w-1/6 p-2">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <thead>
        <tr className="text-left text-gray-400 text-sm"></tr>
      </thead>
      <tbody>
        {parts.map((e) => <PartRow key={e.requestid} part={e} />)}
      </tbody>
    </table>
  )
}