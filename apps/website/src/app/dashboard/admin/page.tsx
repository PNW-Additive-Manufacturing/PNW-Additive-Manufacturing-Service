"use client"

import { Navbar } from '@/app/components/Navigation'

export default function Admin() {
    return (
        <main>
            <Navbar links={[
                {name: "Request a Print", path: "/request-part"},
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Maintainer Dashboard", path: "/dashboard/maintainer"},
                {name: "Logout", path: "/logout"}
            ]}/>

            <div className="bg-white rounded-sm p-14 w-full">
                <h1 className="w-full p-20 text-center text-3xl">Welcome Administrator!</h1>
            </div>
        </main>
    );
}