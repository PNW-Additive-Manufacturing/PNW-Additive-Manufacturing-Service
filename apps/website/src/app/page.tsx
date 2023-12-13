"use server"

import Image from 'next/image';
import Link from 'next/link';
import HorizontalWrap from './components/HorizontalWrap';

function DiscordServer() {
	return <a
		href='https://discord.gg/YtrnzPAfpV' target="_blank"
		className='group text-white bg-cool-black text-sm px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md'>
		Talk with us on Discord
		<Image
			className='w-6 h-6 group fill-white' src="/assets/discord-mark-white.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</a>
}

function GithubProject() {
	return <a
		href='https://github.com/PNW-Additive-Manufacturing' target="_blank"
		className='group text-white text-sm bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md'
	>
		Learn more on Github
		<Image className='w-6 h-6 group' src="/assets/github-mark.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</a>
}

export default async function Home() {
	return (
		<main>
			<HorizontalWrap>
				<div className='w-fit mx-auto'>
					<h1 className="w-fit mb-6 text-3xl">
						Welcome to the
						<span className='text-pnw-gold'> PNW </span>
						Additive Manufacturing Service
					</h1>

					<p style={{maxWidth: "600px"}} className='overflow-hidden w-full sm:w-3/4 md:w-2/3 pb-10'>
						Created by the PNW Additive Manufacturing Club, this service enables PNW students, and faculty members to explore the world of 3D Printing.
					</p>
					
					<a href={"/request-part"} className='block w-fit px-5 py-3 text-lg bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md'>
						Request a Print
					</a>

					{/* <Link href={"/dashboard/user/"} className='border-pnw-gold border-2 mt-2 block w-fit px-3 py-2 text-base tracking-wider font-semibold rounded-md'>
						View Orders
					</Link> */}

					<div className='flex flex-col md:flex-row w-fit mt-20 gap-2 justify-center'>
						<GithubProject />
						<DiscordServer />
					</div>
				</div>
			</HorizontalWrap>
		</main>
	)
}