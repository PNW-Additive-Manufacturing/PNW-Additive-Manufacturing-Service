"use server"

import Image from 'next/image';
import HorizontalWrap from '../components/HorizontalWrap';

export default async function Home() {
	return (
		<main>
			<HorizontalWrap>
				<div className='px-4 lg:grid lg:grid-cols-2 grid-rows-2 grid-flow-col lg:grid-flow-row gap-6 m-auto lg:m-0 w-fit'>
					TODO: Schedule in Design Studio
				</div>
			</HorizontalWrap>
		</main>
	)
}