import AMSIcon from "@/app/components/AMSIcon";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Suspense } from "react";
import Content from "./Content";

export default function ForgotPassword() {

	return (
		<HorizontalWrap className="py-8">
			<div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
				<div className="lg:mx-auto mb-4 w-fit">
					<AMSIcon />
				</div>
				<h1 className="text-xl lg:text-center font-normal mb-2">
					Reset Your Password
				</h1>
				
				<Suspense>

					<Content />

				</Suspense>

			</div>
		</HorizontalWrap>
	);
}
