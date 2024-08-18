import Image from "next/image";
import HorizontalWrap from "../components/HorizontalWrap";

function Card({
	name,
	role,
	avatar,
	email,
}: {
	name: string;
	role: string;
	email?: string;
	avatar: string;
}): JSX.Element {
	return (
		<div
			className="bg-white rounded-lg shadow-sm"
			style={{ width: "12rem" }}>
			<Image
				className="rounded-t-lg"
				src={avatar}
				width={640}
				height={640}
				alt="Profile Picture"></Image>
			<br />
			<div className="px-6 pb-4">
				<h2 className="text-xl text-wrap">{name}</h2>
				<p className="mb-2">{role}</p>
				<a className="text-sm" href={`mailto:${email}`}>
					{email}
				</a>
			</div>
		</div>
	);
}

export default function Team() {
	return (
		<>
			<HorizontalWrap>
				<h1 className="text-3xl tracking-wide font-light my-4 w-fit">
					Our Team
				</h1>
				<p className="mb-4">
					We have a passion for 3D Printing. Feel free to reach out to
					us for any more-advanced projects!
				</p>
				<div className="flex flex-row gap-4 flex-wrap w-fit">
					<Card
						name="Dikshant Sharma"
						role="President"
						email="sharm727@pnw.edu"
						avatar="https://cdn.discordapp.com/avatars/176385201495212033/acac677d4f2185e4a1e57458480477dd.png?size=640"></Card>
					<Card
						name="Alessandro Proserpio"
						role="Vice President"
						avatar="https://static1.campusgroups.com/upload/pnw/2023/s3_image_2387662_0033749524_4ef3babb-ce17-426c-8738-b11c13d8e680_925101734.jpg"></Card>
					<Card
						name="Aaron Jung"
						role="Treasurer"
						avatar="https://cdn.discordapp.com/avatars/1206320920323563551/90761d25f0e7d0c43a147378f5d22e9b.png?size=640"></Card>
					<Card
						name="Gabriel Jang"
						role="Officer"
						avatar="https://cdn.discordapp.com/avatars/696941923365158962/dbc3369d91221001a05c55c62ffb8d10.png?size=640"></Card>
					<Card
						name="Ben Cole"
						role="Officer"
						avatar="https://cdn.discordapp.com/avatars/1137236521573953576/6196559e0ff81d2bc03fcaf713e6fb56.png?size=640"></Card>
					<Card
						name="Luke Moreno"
						role="Technician"
						avatar="https://mypnwlife.pnw.edu/images/ico/male_user_large.png"></Card>
				</div>
			</HorizontalWrap>
		</>
	);
}
