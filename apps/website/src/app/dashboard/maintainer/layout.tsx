import { RegularSearchAlt, RegularLayers, RegularCart, RegularCog, RegularCrossCircle } from "lineicons-react"
import SidebarNavigation from '@/app/components/DashboardNavigation'
import FilamentSpoolIcon from '@/app/components/icons/FilamentSpoolIcon'

export default function MaintainerLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main>
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
