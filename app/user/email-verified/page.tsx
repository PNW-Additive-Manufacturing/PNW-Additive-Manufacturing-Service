import HorizontalWrap from "@/app/components/HorizontalWrap";
import Link from "next/link";

export default function Page() {
	return (
		<HorizontalWrap className="text-center">
			<h1 className="text-3xl font-light mt-8">
				PNW Email Successfully Verified
			</h1>
			<p className="text-base font-normal text-gray-700 mt-4">
				Thank you for verifying your email address with the PNW Additive
				Manufacturing Service. Refresh your page on other devices.
			</p>

			<div className="mt-8 mx-auto w-fit">
				<Link className="" href={"/"}>
					<button className="w-fit mt-6">Return Home</button>
				</Link>
			</div>
		</HorizontalWrap>
	);
}
