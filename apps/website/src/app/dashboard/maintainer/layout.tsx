import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { RegularSearchAlt, RegularLayers, RegularCart, RegularCog, RegularCrossCircle } from "lineicons-react"
import { AccountDetails, ColorfulRequestPrintButton, Navbar } from '@/app/components/Navigation'
import SidebarNavigation from '@/app/components/DashboardNavigation'
// import { Navbar, NavbarLink } from "./components/Navigation";


const inter = Inter({ subsets: ['latin'] })

export default function MaintainerLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main>
		<Navbar 
			includeIcon={false} 
			links={[
				{ name: "User Dashboard", path: "/dashboard/user" }]}
			specialElements={<AccountDetails/>}
		/>

		<div className='flex flex-col lg:flex-row'>
			<SidebarNavigation items={[
				{
					name: "Requests",
					route: "orders",
					icon: (className) => <RegularCart className={`${className}`}></RegularCart>,
					active: true
				},
				{
					name: "Filaments",
					route: "filaments",
					icon: (className) => <RegularCrossCircle className={`${className}`}></RegularCrossCircle>,
					active: false
				}
			]}></SidebarNavigation>

			<div className='w-full p-2 lg:p-12 overflow-y-scroll' style={{ maxHeight: 'calc(100vh - 72px)' }}>
				{children}
			</div>
		</div>
	</main>
}
