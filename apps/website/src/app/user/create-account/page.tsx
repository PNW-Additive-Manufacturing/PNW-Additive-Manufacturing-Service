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
						<select required={false} className="w-full block">
							<option value="freshman" id="freshman">
								Freshman
							</option>
							<option value="sophomore" id="sophomore">
								Sophomore
							</option>
							<option value="junior" id="junior">
								Junior
							</option>
							<option value="senior" id="senior">
								Senior
							</option>
							<option value="senior" id="senior">
								Graduate
							</option>
							<option value="senior" id="senior">
								Faculty
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
							Password must be at least seven characters long. We
							<span className="font-bold"> highly</span> recommend
							using a different password than MyPNW.
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

	return (
		<>
			<div className="w-full lg:w-2/3 xl:w-1/3 lg:mx-auto mt-8 bg-white p-10">
				<h1 className="w-full pb-4 text-right">
					Signing up for
					<span
						className="text-pnw-gold font-bold"
						style={{ fontFamily: "Coda" }}>
						{" "}
						PNW
					</span>
					<span
						style={{
							color: "var(--pnw-black)",
							fontFamily: "Coda"
						}}>
						{" "}
						Additive Manufacturing Service
					</span>
				</h1>
				<div className="py-2 mt-4 pb-10 w-full">
					<form action={formAction}>
						<Input
							label="PNW Email"
							type="text"
							id="user"
							name="email"
							placeholder="Enter your @pnw.edu email"
						/>
						<Input
							label="First Name"
							type="text"
							id="name1"
							name="firstname"
							placeholder="Enter your first name"
						/>
						<Input
							label="Last Name"
							type="text"
							id="name2"
							name="lastname"
							placeholder="Enter your last name"
						/>
						<Input
							label="Password"
							type="password"
							id="pass1"
							name="password"
							placeholder="Choose your password"
						/>
						<Input
							label="Confirm Password"
							type="password"
							id="pass2"
							name="confirm-password"
							placeholder="Confirm your password"
						/>
						<SubmitButton />
						<p className="text-sm text-red-500">{error}</p>
					</form>
				</div>

				<div className="bg-gray-50 p-4" style={{ borderRadius: "5px" }}>
					<p className="w-full pb-4 text-sm text-left">
						Already have an account? Login here!
					</p>
					<a href="/user/login">
						<button>Go to Login Screen</button>
					</a>
				</div>
			</div>
		</>
	);
}
