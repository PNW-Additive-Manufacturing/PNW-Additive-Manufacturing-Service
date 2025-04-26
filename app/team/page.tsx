import Image from "next/image";
import HorizontalWrap from "../components/HorizontalWrap";
import QRCode from "react-qr-code";

function Card({
	name,
	role,
	avatar,
	email,
	phone
}: {
	name: string;
	role: string;
	email?: string;
	phone?: string;
	avatar: string;
}): JSX.Element {
	return (
		<div
			className="bg-white rounded-md shadow-sm p-4 xl:flex gap-3 out">
			<Image
				className="rounded-md w-32 h-32 max-xl:mx-auto"
				src={avatar}
				width={640}
				height={640}
				alt="Profile Picture"></Image>
			<br />
			<div className="xl:pr-6 pb-4 py-2 max-xl:mx-auto w-fit">
				<h2 className="text-xl text-wrap">{name}</h2>
				<p className="mb-2 mt-1 text-sm">{role}.</p>
				{email && <a className="text-sm" href={`mailto:${email}`}>
					{email}
				</a>}
				{phone && <p className="mt-1 text-sm">{phone}</p>}
			</div>
		</div>
	);
}

export default function Team() {
	return (
		<>
			<HorizontalWrap>
				<div className="py-8">
					<h1 className="w-fit text-2xl font-normal">
						Our Team
					</h1>
					<p className="mt-2">
						We are passionate about 3D Printing, and many of our team members are actively involved in both the Additive Manufacturing Club and the ASME Club.
						This shared expertise allows us to provide comprehensive support for all your 3D printing and modeling needs.
						Feel free to reach out with any questions or projects you'd like assistance with—please allow up to two days for a response.
					</p>
					<br />

					<div className="grid grid-cols-2 lg:grid-cols-3 max-lg:justify-between max-lg:gap-y-4 gap-4 w-full">
						<Card
							name="Aaron Jung"
							role="President and Developer"
							email="jung416@pnw.edu"
							phone="630-862-5509"
							avatar="https://cdn.discordapp.com/avatars/1206320920323563551/90761d25f0e7d0c43a147378f5d22e9b.png?size=640" />
						<Card
							name="David Holleman"
							role="Former Officer and Developer"
							email="dhollema@pnw.edu"
							avatar="/assets/david.jpg" />
						<Card
							name="Ben Cole"
							role="Vice President"
							email="cole289@pnw.edu"
							avatar="https://cdn.discordapp.com/avatars/1137236521573953576/6196559e0ff81d2bc03fcaf713e6fb56.png?size=640" />
						<Card
							name="Gabriel Jang"
							role="Treasurer"
							email="jang233@pnw.edu"
							avatar="https://cdn.discordapp.com/avatars/696941923365158962/dbc3369d91221001a05c55c62ffb8d10.png?size=640" />
						<Card
							name="Luke Moreno"
							role="Secretary"
							email="moren124@pnw.edu"
							avatar="/assets/luke.webp" />
						<Card
							name="Dikshant Sharma"
							role="Previous President"
							email="sharm727@pnw.edu"
							avatar="https://cdn.discordapp.com/avatars/176385201495212033/acac677d4f2185e4a1e57458480477dd.png?size=640" />
					</div>
				</div>
			</HorizontalWrap>
		</>
	);
}
