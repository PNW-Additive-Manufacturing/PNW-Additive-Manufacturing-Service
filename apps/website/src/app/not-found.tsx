"use client"

import { Navbar } from '@/app/components/Navigation'

export default function NotFound() {

  return (
    <main>      
        <Navbar links={[]}/>

        <div className="bg-white rounded-sm p-14 w-full">
            <h1 className="w-full p-20 text-center text-3xl">404 - This page could not be found.</h1>
        </div>
    </main>
  )
}