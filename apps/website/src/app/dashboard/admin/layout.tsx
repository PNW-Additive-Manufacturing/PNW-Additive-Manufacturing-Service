import { RegularUser } from "lineicons-react"
import SidebarNavigation from '@/app/components/DashboardNavigation'
import GenericPrinterIcon from '@/app/components/icons/GenericPrinterIcon'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main>
		<div className='flex flex-col lg:flex-row'>
			<SidebarNavigation items={[
				{
					name: "Users",
					route: "../admin/users",
					icon: (className) => <RegularUser className={`${className}`}></RegularUser>,
					active: false
				},
				{
					name: "Printers",
					route: "../admin/printers",
					icon: (className) => <GenericPrinterIcon className={`${className} w-8 h-8`}/>,
					active: false
				}
			]}></SidebarNavigation>

			<div className='w-full p-2 pt-4 lg:p-12 overflow-y-scroll' style={{ maxHeight: 'calc(100vh - 72px)' }}>
				{children}
			</div>
		</div>
	</main>
}