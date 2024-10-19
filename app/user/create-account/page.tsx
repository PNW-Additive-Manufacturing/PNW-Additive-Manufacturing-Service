"use client";

import { Input } from "@/app/components/Input";
import { useFormState, useFormStatus } from "react-dom";
import { tryCreateAccount } from "@/app/api/server-actions/account";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import Image from "next/image";
import { ProgressBar } from "@/app/components/ProgressBar";

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<input
			className="mb-0"
			type="submit"
			value={pending ? "Creating Account..." : "Create Account"}
		/>
	);
}

//using this pattern allows us to perform client side validation before sending a request to the
//server to create the account. This can reduce the number of server calls and client
//side validation is much faster than server-side validation.
async function clientSideValidation(prevState: string, formData: FormData) {
	let password = formData.get("password");
	let confirmPassword = formData.get("confirm-password");

	if (password !== confirmPassword) {
		return "Passwords do not match!";
	}

	return await tryCreateAccount(prevState, formData);
}

export default function CreateAccount() {
	//note that Server component cannot return null or Class objects, only plain JSONs and primitive types
	let [error, formAction] = useFormState<string, FormData>(
		clientSideValidation,
		""
	);

	return (
		<HorizontalWrap>
			<div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
				<Image
					src={"/assets/logo.svg"}
					width={400}
					height={400}
					alt="Logo"
					className="w-1/4 lg:mx-auto mb-4"></Image>
				<h1 className="text-xl lg:mx-auto font-normal w-fit">
					Sign up for Additive Manufacturing Service
				</h1>
				<br />
				<div className="py-2 w-full">
					<form action={formAction}>
						<Input
							required={true}
							label="Purdue Northwest Email"
							type="text"
							id="user"
							name="email"
							placeholder="Enter your PNW Email"
						/>
						<div className="lg:flex gap-4">
							<Input
								required={true}
								label="First Name"
								type="text"
								id="name1"
								name="firstname"
								placeholder="Leo"
							/>
							<Input
								required={true}
								label="Last Name"
								type="text"
								id="name2"
								name="lastname"
								placeholder="Lion"
							/>
						</div>
						<label>Year of Study</label>
						<select required id="year-of-study" name="year-of-study" className="w-full block">
							<option value="Freshman" id="freshman">
								Freshman
							</option>
							<option value="Sophomore" id="sophomore">
								Sophomore
							</option>
							<option value="Junior" id="junior">
								Junior
							</option>
							<option value="Senior" id="senior">
								Senior
							</option>
							<option value="Graduate" id="graduate">
								Graduate
							</option>
							<option value="Faculty" id="faculty">
								Faculty
							</option>
							<option value="Professor" id="professor">
								Professor
							</option>
						</select>
						<Input
							required={true}
							label="Password"
							type="password"
							id="pass1"
							name="password"
							placeholder="Choose your Password"
						/>
						<p className="text-sm mb-2">
							Password must be at least eight characters long. We
							recommend using a different password than MyPNW.
						</p>
						<Input
							required={true}
							label="Confirm Password"
							type="password"
							id="pass2"
							name="confirm-password"
							placeholder="Confirm your Password"
						/>
						<SubmitButton />
						<p className="text-sm text-red-500">{error}</p>
					</form>
				</div>

				<a href="/user/login">
					<p className="w-full pb-4 text-sm text-left underline">
						Already have an account? Sign in!
					</p>
				</a>
			</div>
		</HorizontalWrap>
	);
}
