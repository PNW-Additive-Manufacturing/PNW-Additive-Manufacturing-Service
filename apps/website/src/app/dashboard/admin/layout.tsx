import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { RegularUser } from "lineicons-react"
import { AccountDetails, Navbar } from '@/app/components/Navigation'
import SidebarNavigation from '@/app/components/DashboardNavigation'
import GenericPrinterIcon from '@/app/components/icons/GenericPrinterIcon'
// import GenericPrinterIcon from '@/app/components/images/GenericPrinterIcon';



export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main>
		<Navbar 
			links={[
				{ name: "User Dashboard", path: "/dashboard/user" },
				{ name: "Maintainer Dashboard", path: "/dashboard/maintainer" }]}
			specialElements={<AccountDetails/>}
		/>

		<div className='flex flex-col lg:flex-row'>
			<SidebarNavigation style={{ height: 'calc(100vh - 72px)' }} items={[
				{
					name: "Users",
					route: "../admin/users",
					icon: (className) => <RegularUser className={`${className}`}></RegularUser>,
					active: false
				},
				{
					name: "Printers",
					route: "../admin/printers",
					// icon: (className) => <RegularCog className={`${className}`}></RegularCog>,
					icon: (className) => <GenericPrinterIcon className={`${className} w-8 h-8`}/>,
					active: false
				}
			]}></SidebarNavigation>

			<div className='w-full p-2 lg:p-12 overflow-y-scroll' style={{ maxHeight: 'calc(100vh - 72px)' }}>
				{children}
			</div>
		</div>
	</main>
}
