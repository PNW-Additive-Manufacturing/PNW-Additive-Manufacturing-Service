import Image from 'next/image'

import { PartList, Part } from '@/app/components/PartList'

export default function Home() {
  let parts = [
    {
      id: '1',
      name: 'Name1',
      date: new Date(),
      status: "Pending"
    },
    {
      id: '2',
      name: 'Name2',
      date: new Date((new Date()).getTime() + 1*60*60*24*1000),
      status: "Pending"
    },
    {
      id: '3',
      name: 'Name3',
      date: new Date((new Date()).getTime() + 2*60*60*24*1000),
      status: "Pending"
    },
  ]
  return (
    <main>      
      <h1>Purdue Northwest 3D Printing</h1>
      <div className="flex">
        <a href="request">Request a Print</a>
        {/* <button className="flex-1">Request a Print</button> */}
        <button className="flex-1">View status of a Print</button>
      </div>

      <h2 className="p-3 text-4xl font-extrabold dark:text-black">Part List</h2> 

      <PartList parts={parts}/>
    </main>
  )
}
