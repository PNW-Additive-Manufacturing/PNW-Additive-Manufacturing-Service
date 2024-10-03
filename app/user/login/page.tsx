"use client";

import { Input } from "@/app/components/Input";
import { tryLogin } from "@/app/api/server-actions/account";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import AMSIcon from "@/app/components/AMSIcon";

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<input
			className="mb-0"
			type="submit"
			value={pending ? "Singing in" : "Sign in"}
		/>
	);
}

export default function Login() {
	//note that Server component cannot return null or Class objects, only plain JSONs and primitive types
	let [error, formAction] = useFormState<string, FormData>(tryLogin, "");

	return (
		<HorizontalWrap>
			<div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
				<div className="lg:mx-auto mb-4 w-fit">
					<AMSIcon />
				</div>
				<h1 className="text-xl mx-auto font-normal w-fit">
					Sign into Additive Manufacturing Service
				</h1>
				<br />
				<div className="py-2 w-full">
					<form action={formAction}>
						<Input
							label="Purdue Northwest Email"
							type="text"
							id="email"
							name="email"
							required={true}
							placeholder="Enter your PNW Email"
						/>
						<Input
							label="Password"
							type="password"
							id="password"
							name="password"
							required={true}
							placeholder="Enter your Password"
						/>
						<SubmitButton />
						<p className="text-sm text-red-500 uppercase">
							{error}
						</p>
					</form>
				</div>

				<a href="/user/create-account">
					<p className="w-full pb-4 text-sm text-left underline">
						Don't have an account? Create one!
					</p>
				</a>
			</div>
		</HorizontalWrap>
	);
}
