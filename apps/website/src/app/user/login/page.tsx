"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation';
import { tryLogin } from '@/app/api/server-actions/account';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <input type="submit" value={pending ? "Logging you in..." : "Login"} />
}

export default function Login() {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let [error, formAction] = useFormState<string, FormData>(tryLogin, "");

    return <>
        <Navbar links={[]} />

        <div className='w-full lg:w-2/3 xl:w-1/3 lg:mx-auto mt-8 bg-white p-10'>
            <h1 className="w-full pb-4 text-right">Logging into  
                <span className="text-pnw-gold font-bold" style={{fontFamily: "Coda" }}> PNW</span>
                <span style={{color: "var(--pnw-black)", fontFamily: "Coda" }}> Additive Manufacturing Service</span>
            </h1>
            <div className="py-2 mt-4 pb-10 w-full">
                <form action={formAction}>
                    <Input label="Email" type="text" id="email" name="email" placeholder="Enter your @pnw.edu email" />
                    <Input label="Password" type="password" id="password" name="password" placeholder="Enter your password" />
                    <SubmitButton />
                    <p className="text-sm text-red-500">{error}</p>
                </form>
            </div>

            <div className='bg-gray-50 p-4' style={{borderRadius: "5px"}}>
                <p className="w-full pb-4 text-sm text-left">Don't have an account? Create one!</p>
                <a href="/user/create-account"><button>Create a new account</button></a>
            </div>
        </div>
    </>
}