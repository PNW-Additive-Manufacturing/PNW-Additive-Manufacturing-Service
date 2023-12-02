"use client"

import { Navbar } from '@/app/components/Navigation'

export default function Admin() {
    return (
        <main>
            <Navbar links={[
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Maintainer Dashboard", path: "/dashboard/maintainer"}
            ]}/>

            
        </main>
    );
}