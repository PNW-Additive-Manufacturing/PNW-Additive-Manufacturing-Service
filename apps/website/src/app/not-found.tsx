import { AccountDetails, ColorfulRequestPrintButton, Navbar } from '@/app/components/Navigation'
import Link from 'next/link'

export default function NotFound() {

	return (
		<main>
			<Navbar 
				links={[
					{
						name: "Orders",
						path: "/dashboard/user"
					}
				]}
				specialElements={<>
					<ColorfulRequestPrintButton/>
					<AccountDetails/>
				</>} 
			/>

			<div className="bg-white rounded-sm p-14 w-full">
				<h1 className="w-full p-20 text-center text-3xl">404 - Page Not Found</h1>
			</div>
		</main>
	)
}