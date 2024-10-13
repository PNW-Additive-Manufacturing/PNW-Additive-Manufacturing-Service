"use client";

import { Input } from "@/app/components/Input";
import { tryLogin } from "@/app/api/server-actions/account";
import { useFormState } from "react-dom";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import AMSIcon from "@/app/components/AMSIcon";
import { Label } from "@/app/components/Inputs";
import FormSubmitButton from "@/app/components/FormSubmitButton";

export default function Login() {
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
						<a href="/user/forgot-password">
							<p className="w-full pb-4 text-sm text-left underline">
								Have you forgot your password? Reset it here!
							</p>
						</a>
						<Label content={"Session Duration"} />
						<select id="session-duration" defaultValue={"1w"}>
							<option value="1d">Day</option>
							<option value="1w">Week</option>
							<option value="1m">Month</option>
							<option value="1y">Year</option>
						</select>
						<FormSubmitButton label="Sign In" />
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
