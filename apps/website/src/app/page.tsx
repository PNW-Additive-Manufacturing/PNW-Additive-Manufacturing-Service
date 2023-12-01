import Image from 'next/image'

import { PartList, Part } from '@/app/components/PartList'
import { Navbar } from './components/Navigation'

import db from '@/app/backend/Database';

export default async function Home() {
  //testing database connection using query
  let dbResponse = await db`select * from account`


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
  ];

  console.log(dbResponse);

  return (
    <main>      
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
      ]}/>
      <p>Database Test: {JSON.stringify(dbResponse)}</p>
      <h1>Welcome, Aaron Jung!</h1>

      <h2 className="p-3 text-4xl font-extrabold text-center sdark:text-black">Your Pending Parts</h2> 

      <PartList parts={parts}/>

      <h2 className="p-3 text-4xl font-extrabold text-center sdark:text-black">Your Completed Parts</h2> 

      <PartList parts={parts}/>
    </main>
  )
}
