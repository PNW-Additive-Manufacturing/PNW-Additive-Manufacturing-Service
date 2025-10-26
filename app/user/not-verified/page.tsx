import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Suspense } from "react";
import EmailValidation from "./EmailValidation";

export default async function Page() {

	return (
		<HorizontalWrap className="py-8">

			<div className="mx-auto w-fit">

				{/* <AMSIcon /> */}
				<h1 className="text-2xl mt-8">Validate PNW Email</h1>
				<p className="mt-4">
					You must confirm your student or faculty email at PNW to use
					this service.
				</p>
				
				<Suspense>

					<EmailValidation />

				</Suspense>

			</div>

		</HorizontalWrap>
	);
}
