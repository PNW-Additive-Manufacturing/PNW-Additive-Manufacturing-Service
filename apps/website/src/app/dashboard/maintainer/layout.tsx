import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { RegularSearchAlt, RegularLayers, RegularCart, RegularCog, RegularCrossCircle } from "lineicons-react"
import { AccountDetails, ColorfulRequestPrintButton, Navbar } from '@/app/components/Navigation'
import SidebarNavigation from '@/app/components/DashboardNavigation'
import FilamentSpoolIcon from '@/app/components/icons/FilamentSpoolIcon'
// import { Navbar, NavbarLink } from "./components/Navigation";


const inter = Inter({ subsets: ['latin'] })

export default function MaintainerLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main>
		<Navbar 
			links={[
				{ name: "User Dashboard", path: "/dashboard/user" }]}
			specialElements={<AccountDetails/>}
			style={{marginBottom: "0px"}}
		/>

		<div className='flex flex-col lg:flex-row'>
			<SidebarNavigation items={[
				{
					name: "Requests",
					route: "orders",
					icon: (className) => <RegularCart className={`${className}`}></RegularCart>,
					active: false
				},
				{
					name: "Filaments",
					route: "filaments",
						icon: (className, active) => <FilamentSpoolIcon className={`${className} ${active ? 'fill-amber-600' : 'fill-cool-black '}`}/>,
					active: false
				}
			]}></SidebarNavigation>

			<div className='w-full p-2 pt-4 lg:p-12 overflow-y-scroll' style={{ maxHeight: 'calc(100vh - 72px)' }}>
				{children}
			</div>
		</div>
	</main>
}
