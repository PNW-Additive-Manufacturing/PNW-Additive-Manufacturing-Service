import AMImage from "../components/AMImage";
import HorizontalWrap from "../components/HorizontalWrap";

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
}): React.ReactElement {
	return <>

		<div>

			<AMImage src={avatar} width={720} height={720} alt="Profile Picture" className="w-full aspect-square rounded" />
			<div className="pb-4 py-2 w-fit mt-2">
				<h2 className="text-2xl font-bold text-black text-wrap">{name}</h2>
				<p className="mb-2 mt-1 text-sm">{role}.</p>
				{email && <a className="text-sm" href={`mailto:${email}`}>{email}</a>}
				{/* {phone && <p className="mt-1 text-sm">{phone}</p>} */}
			</div>

		</div>
	</>
}

export default function Team() {
	return (
		<>
			<HorizontalWrap>
				<div className="py-8">
					<h1 className="text-2xl font-normal">
						Leadership
					</h1>
					<p className="mt-2">We are passionate about 3D Printing, and many of our team members are actively involved in both the Additive Manufacturing Club and the ASME Club.</p>

					<br />

					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-lg:justify-between max-lg:gap-y-4 gap-6 w-full">
						<Card
							name="Aaron Jung"
							role="Developer and President of AM Club"
							email="jung416@pnw.edu"
							phone="630-862-5509"
							avatar="/assets/aaron.png" />
						<Card
							name="Ben Cole"
							role="Vice President of AM Club"
							email="cole289@pnw.edu"
							avatar={"/assets/ben.jpg"} />
						<Card
							name="Gabriel Jang"
							role="Treasurer of AM Club"
							email="jang233@pnw.edu"
							avatar="https://cdn.discordapp.com/avatars/696941923365158962/dbc3369d91221001a05c55c62ffb8d10.png?size=640" />
						<Card
							name="Luke Moreno"
							role="Secretary of AM Club"
							email="moren124@pnw.edu"
							avatar="/assets/luke.webp" />

						<Card
							name={"Jih Bin Luo"}
							role={"Developer"}
							avatar={"/assets/jih.jpg"} />

						<Card
							name={"Justin Meng"}
							role={"Developer"}
							avatar={"/assets/justin.jpeg"} />


						<Card
							name="David Holleman"
							role="Former Developer"
							email=""
							avatar="/assets/david.jpg" />
					</div>
				</div>
			</HorizontalWrap>
		</>
	);
}
