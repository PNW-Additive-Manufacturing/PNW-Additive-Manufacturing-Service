import { PartList, Part } from '@/app/components/PartList'
import { Navbar } from '@/app/components/Navigation'


export default async function User() {

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

  return (
    <main>      
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Logout", path: "/logout"}
      ]}/>
      <h1>Welcome, Aaron Jung!</h1>

      <h2 className="p-3 text-4xl font-extrabold text-center sdark:text-black">Your Pending Parts</h2> 

      <PartList parts={parts}/>

      <h2 className="p-3 text-4xl font-extrabold text-center sdark:text-black">Your Completed Parts</h2> 

      <PartList parts={parts}/>
    </main>
  )
}
