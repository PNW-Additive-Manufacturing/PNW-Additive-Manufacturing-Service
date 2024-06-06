"use client"

import { Input } from '@/app/components/Input';
import { tryLogin } from '@/app/api/server-actions/account';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <input className='my-2' type="submit" value={pending ? "Logging you in..." : "Login"} />
}

export default function Login() {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let [error, formAction] = useFormState<string, FormData>(tryLogin, "");

    return <>
        <div className='w-full lg:w-2/3 xl:w-1/3 lg:mx-auto bg-white p-10'>
            <Image src={"/assets/logo.svg"} width={400} height={400} alt='Logo' className='w-1/4 mx-auto mb-4'></Image>
            <h1 className='text-xl mx-auto w-fit'>Login to AMS</h1>
            {/* <h1 className="w-full pb-4 text-right">Logging into  
                <span className="text-pnw-gold font-bold" style={{fontFamily: "Coda" }}> PNW</span>
                <span style={{color: "var(--pnw-black)", fontFamily: "Coda" }}> Additive Manufacturing Service</span>
            </h1> */}
            <div className="py-2 mt-4 w-full">
                <form action={formAction}>
                    <Input label="Email" type="text" id="email" name="email" placeholder="Enter your @pnw.edu email" />
                    <Input label="Password" type="password" id="password" name="password" placeholder="Enter your password" />
                    <SubmitButton/>
                    <p className="text-sm text-red-500 uppercase">{error}</p>
                </form>
            </div>

            <a href="/user/create-account"><p className="w-full pb-4 text-sm text-left underline">Don't have an account? Create one!</p></a>
        </div>
    </>
}