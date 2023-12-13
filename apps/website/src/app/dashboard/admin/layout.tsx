import { RegularUser } from "lineicons-react"
import { SidebarNavigation } from '@/app/components/SidebarNavigation'
import GenericPrinterIcon from '@/app/components/icons/GenericPrinterIcon'
import HorizontalWrap from "@/app/components/HorizontalWrap"

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <>{children}</>
}