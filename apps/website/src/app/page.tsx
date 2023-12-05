"use client"

import { Navbar } from '@/app/components/Navigation'

export default async function Home() {

  return (
    <main>
      <Navbar links={[
        {name: "Test NextJS API", path: "/test-next-api"},
        {name: "User Dashboard", path: "/dashboard/user"},
        {name: "Maintainer Dashboard", path: "/dashboard/maintainer"},
        {name: "Admin Dashboard", path: "/dashboard/admin"},
        {name: "Create Account", path: "/user/create-account"},
        {name: "Login", path: "/user/login"}
      ]}/>

      <div className="bg-white rounded-sm p-10 w-full">
        <h1 className="w-full p-20 text-center text-3xl">Welcome to the PNW 3D Printing Service</h1>
        <a className='text-xl flex justify-center' href='https://github.com/PNW-Additive-Manufacturing' target="_blank">Learn more about the project here</a>
      </div>
    </main>
  )
}