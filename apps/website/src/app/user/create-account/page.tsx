"use client"

import { Input } from '@/app/components/Input';
import { useFormState, useFormStatus } from 'react-dom';
import { tryCreateAccount } from '@/app/api/server-actions/account';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <input type="submit" value={pending ? "Creating Account..." : "Create Account"} />
}

//using this pattern allows us to perform client side validation before sending a request to the
//server to create the account. This can reduce the number of server calls and client
//side validation is much faster than server-side validation.
async function clientSideValidation(prevState: string, formData: FormData) {
    let password = formData.get("password");
    let confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
        return "Password in field does not match Check Password field. Make sure they match!";
    }

    return await tryCreateAccount(prevState, formData);
}

export default function CreateAccount() {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let [error, formAction] = useFormState<string, FormData>(clientSideValidation, "");

    return <>
        <div className="w-full lg:w-2/3 xl:w-1/3 lg:mx-auto mt-8 bg-white p-10">
            <h1 className="w-full pb-4 text-right">Signing up for
                <span className="text-pnw-gold font-bold" style={{fontFamily: "Coda" }}> PNW</span>
                <span style={{color: "var(--pnw-black)", fontFamily: "Coda" }}> Additive Manufacturing Service</span>
            </h1>
            <div className="py-2 mt-4 pb-10 w-full">
                <form action={formAction}>
                    <Input label="PNW Email" type="text" id="user" name="email" placeholder="Enter your @pnw.edu email" />
                    <Input label="First Name" type="text" id="name1" name="firstname" placeholder="Enter your first name" />
                    <Input label="Last Name" type="text" id="name2" name="lastname" placeholder="Enter your last name" />
                    <Input label="Password" type="password" id="pass1" name="password" placeholder="Choose your password" />
                    <Input label="Confirm Password" type="password" id="pass2" name="confirm-password" placeholder="Confirm your password" />
                    <SubmitButton />
                    <p className="text-sm text-red-500">{error}</p>
                </form>
            </div>

            <div className='bg-gray-50 p-4' style={{borderRadius: "5px"}}>
                <p className="w-full pb-4 text-sm text-left">Already have an account? Login here!</p>
                <a href='/user/login'><button>Go to Login Screen</button></a>
            </div>
        </div>
    </>
}