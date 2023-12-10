import { AccountDetails, Navbar } from '@/app/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';

function DiscordServer() {
	return <Link
		href='https://discord.gg/YtrnzPAfpV' target="_blank"
		className='group text-white bg-cool-black text-sm px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md'>
		Talk with us on Discord
		<Image
			className='w-6 h-6 group fill-white' src="/assets/discord-mark-white.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</Link>
}

function GithubProject() {
	return <Link
		href='https://github.com/PNW-Additive-Manufacturing' target="_blank"
		className='group text-white text-sm bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md'
	>
		Learn more on Github
		<Image className='w-6 h-6 invert group' src="/assets/github-mark.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</Link>
}

export default async function Home() {

	return (
		<main>
			<Navbar
				links={[
					{ name: "User Dashboard", path: "/dashboard/user" },
					{ name: "Maintainer Dashboard", path: "/dashboard/maintainer" },
					{ name: "Admin Dashboard", path: "/dashboard/admin" }]}
				specialElements={<>
					<AccountDetails />
				</>}
			/>

			<div className="rounded-sm p-10 w-full">
				{/* <h1 className="w-full p-20 text-center text-3xl">Welcome to the PNW <span className='bg-gradient-linear-pnw-mystic p-2 pb-1 rounded-lg text-opacity-100'>Additive Manufacturing Service</span></h1> */}
				<h1 className="w-full p-20 pb-8 text-center text-3xl">
					Welcome to the
					<span className='text-pnw-gold'> PNW </span>
					Additive Manufacturing Service
				</h1>
				<p className='block w-1/3 mx-auto pb-10'>Created by the PNW Additive Manufacturing Club, this service enables PNW students, and faculty members to explore the world of 3D Printing.</p>

				<Link href={"/request-part"} className='block mb-10 w-fit px-5 py-3 text-lg bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md mx-auto'>
					Request a Print
				</Link>

				{/* <div className='absolute opacity-30 rotate-45 w-12 h-12' style={{transform: 'translateX(calc(50vw - 1.5rem)) '}}>
        </div> */}

				<div className='flex flex-col gap-2 justify-center items-center'>
					<GithubProject />
					<DiscordServer />
				</div>
			</div>
		</main>
	)
}