"use server"

import Image from 'next/image';
import HorizontalWrap from './components/HorizontalWrap';

function DiscordServer() {
	return <a
		href='https://discord.gg/YtrnzPAfpV' target="_blank"
		className='group text-white bg-cool-black text-sm px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm'>
		Talk with us on Discord
		<Image
			className='w-6 h-6 group fill-white' src="/assets/discord-mark-white.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</a>
}

function GithubProject() {
	return <a
		href='https://github.com/PNW-Additive-Manufacturing' target="_blank"
		className='group text-white text-sm bg-cool-black px-4 py-2 flex gap-2 items-center w-fit h-fit rounded-md shadow-sm'
	>
		Learn more on Github
		<Image className='w-6 h-6 group' src="/assets/github-mark.svg" alt='GitHub Logo' width={50} height={50}></Image>
	</a>
}

export default async function Home() {
	return (
		<div>
			<HorizontalWrap>
				<div className='lg:grid lg:grid-cols-2 grid-rows-2 grid-flow-col lg:grid-flow-row gap-6 m-auto lg:m-0 w-fit'>
					<div className='w-full mb-10 lg:mb-0 mt-4'>
						<h1 className="w-fit mb-6 text-3xl">
							Welcome to the
							<span className='text-pnw-gold'> PNW </span>
							Additive Manufacturing Service
						</h1>

						<p style={{maxWidth: "600px"}} className='overflow-hidden w-full pb-4'>
							Created by the PNW Additive Manufacturing Club, this service enables PNW students, and faculty members to explore the world of 3D Printing.
						</p>

						<ul> 
							<li>Rapid-Prototyping</li>
							<li>Connectors / Mounts</li>
							<li>Prosthetics</li>
							<li>Creative Models</li>
						</ul>
						
						<div className='pt-10'>
							<a href={"/request-part"} className='block w-fit px-5 py-3 text-lg bg-gradient-linear-pnw-mystic tracking-wider font-semibold uppercase rounded-md shadow-sm'>Request a Print</a>
							<a href={"/schedule"} className='block w-fit px-3 py-3 text-xs tracking-wider underline'>Or, Meet a Technician!</a>

							<div className='flex flex-col md:flex-row w-fit mt-6 gap-2 justify-center'>
								<DiscordServer />
								<GithubProject />
							</div>
						</div>
					</div>
					<Image src={"/assets/lab_setup_1.jpg"} width={760} height={760} alt="" className='block bg-black rounded-lg object-cover object-center shadow-xl w-full h-full'></Image>
				</div>
			</HorizontalWrap>
		</div>
	)
}