"use client"

import { AccountDetails, ColorfulRequestPrintButton, Navbar } from '@/app/components/Navigation';
import Image from 'next/image';

function GithubProject()
{
  return <a 
    href='https://github.com/PNW-Additive-Manufacturing' target="_blank"
    className='group text-white bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md'
  >
    Learn more on Github
    <Image className='w-6 h-6 invert group' src="/assets/github-mark.svg" alt='GitHub Logo' width={50} height={50}></Image>
  </a>
}

export default async function Home() {

  return (
    <main>
      <Navbar 
        links={[
          {name: "User Dashboard", path: "/dashboard/user"},
          {name: "Maintainer Dashboard", path: "/dashboard/maintainer"},
          {name: "Admin Dashboard", path: "/dashboard/admin"}]}
        specialElements={<>
          <ColorfulRequestPrintButton/>
          <AccountDetails/>
        </>}
      />

      <div className="rounded-sm p-10 w-full">
        <h1 className="w-full p-20 text-center text-3xl">Welcome to the PNW <span className='bg-gradient-linear-pnw-mystic p-2 pb-1 rounded-lg text-opacity-100'>Additive Manufacturing Service</span></h1>
        {/* <h1 className="w-full p-20 text-center text-3xl">Welcome to the PNW Additive Manufacturing Service</h1> */}

        <div className='flex justify-center'>
          <GithubProject></GithubProject>
        </div>
      </div>
    </main>
  )
}