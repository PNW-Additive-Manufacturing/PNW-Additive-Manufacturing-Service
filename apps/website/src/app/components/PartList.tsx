import { getModel } from "@/app/api/util/GetModel";

export interface Part {
    id: number,
    requestid: number,
    modelid: number,
    quantity: number,
    status: string
}

export interface Model {
    id: number,
    name: string
}

async function PartRow({part}: {part: Part}): Promise<JSX.Element> {
    let model = await getModel(part.modelid);

  return (
    <tr className="text-left">
      <td className="">{model.name}</td>
      <td className="">{part.quantity}</td>
      <td className="">{part.status}</td>
    </tr>
  )
}

export function PartList({parts}: {parts: Part[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <thead>
        <tr className="text-left text-gray-400 text-sm">
          <th className="">Part Name</th>
          <th className="">Quantity</th>
          <th className="">Status</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((e) => <PartRow key={e.id} part={e} />)}
      </tbody>
    </table>
  )
}