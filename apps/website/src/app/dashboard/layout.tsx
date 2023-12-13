import { RegularUser } from "lineicons-react"
import { SidebarNavigation } from '@/app/components/SidebarNavigation'
import GenericPrinterIcon from '@/app/components/icons/GenericPrinterIcon'
import HorizontalWrap from "@/app/components/HorizontalWrap"

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <main className='w-full p-0 md:p-2'>
		<HorizontalWrap>{children}</HorizontalWrap>
	</main>
}