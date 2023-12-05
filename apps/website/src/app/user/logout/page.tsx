"use client"
import { Navbar } from "@/app/components/Navigation";

export default async function Logout() {
  return (
    <main>
      <Navbar links={[
        {name: "Login", path: "/user/login"}
      ]}/>

      <div className="bg-white rounded-sm p-14 w-full">
        <h1 className="w-full p-20 text-center text-3xl">{"You have been logged out!"}</h1>
      </div>
    </main>
  );
}