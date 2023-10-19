import Image from 'next/image'

export default function Home() {
  return (
    <main>      
      <h1>Purdue Northwest 3D Printing</h1>
      <div className="flex">
        <button className="flex-1">Request a Print</button>
        <button className="flex-1">View status of a Print</button>
      </div>
    </main>
  )
}
