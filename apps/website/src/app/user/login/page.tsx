"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation';
import { tryLogin } from '@/app/api/server-actions/account';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <input type="submit" value={pending ? "Logging you in..." : "Login"}/>
}

export default function Login() {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let [error, formAction] = useFormState<string, FormData>(tryLogin, "");

    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Login</h1>
                <form action={formAction}>
                    <Input label="PNW Email" type="text" id="email" name="email" placeholder="Enter your @pnw.edu email"/>
                    <Input label="Password" type="password" id="password" name="password" placeholder="Enter your password"/>
                    <SubmitButton/>

                    <p className="text-sm text-red-500">{error}</p>
                </form>
                
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Don't have an account? Create one!</h1>
                <a href="/user/create-account"><button>Create a new account</button></a>
            </div>
        </main>
    );
}