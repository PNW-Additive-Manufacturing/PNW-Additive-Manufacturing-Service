"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation'
import { useFormState, useFormStatus } from 'react-dom';

import { tryCreateAccount } from '@/app/server-actions/account';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <input type="submit" value={pending ? "Creating Account..." : "Create Account"}/>
}


export default function CreateAccount() {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let [error, formAction] = useFormState<string, FormData>(tryCreateAccount, "");

    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Create Account</h1>
                <form action={formAction}>
                    <Input label="PNW Email" type="text" id="user" name="email" placeholder="Enter your @pnw.edu email"/>
                    <Input label="First Name" type="text" id="name1" name="firstname" placeholder="Enter your first name"/>
                    <Input label="Last Name" type="text" id="name2" name="lastname" placeholder="Enter your last name"/>
                    <Input label="Password" type="password" id="pass1" name="password" placeholder="Choose your password"/>
                    <Input label="Confirm Password" type="password" id="pass2" name="confirm-password" placeholder="Confirm your password"/>
                    <SubmitButton/>
                    <p className="text-sm text-red-500">{error}</p>
                </form>
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Already have an account? Login here!</h1>
                <button> Go to Login Screen </button>
            </div>
        </main>
    );
}