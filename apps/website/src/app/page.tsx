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
        {name: "Create Account", path: "/create-account"},
        {name: "Login", path: "/login"}
      ]}/>
    </main>
  )
}