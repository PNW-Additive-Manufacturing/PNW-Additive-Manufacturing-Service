"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
//experimental
//import { useFormState } from 'react-dom';


export default function Login() {
    let [errorMessage, setErrorMessage] = useState("");
    let router = useRouter();

    let attemptLogin = async function (event: any) {
        event.preventDefault(); //NEEDED
        let email = event.target.email.value as string ?? "";
        let password = event.target.password.value as string ?? "";

        console.log(email);
    
        if(email === "" || password === "") {
            setErrorMessage("Email or Password fields are empty!");
            return;
        } 
    
        try {
            let json = await (await fetch("/api/accounts/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })).json();
        
            console.log(json);
            if(json.error) {
                setErrorMessage(json.error);
                return;
            }
        
            if(!json.success) {
                setErrorMessage("Incorrect Password!");
                return;
            }

            router.replace("/dashboard/user");
        } catch(e) {
            console.error(e);
        }
        
    
        
    
      //  redirect("/dashboard/user");
    };

    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Login</h1>
                <form method="post" onSubmit={attemptLogin}>
                    <Input label="PNW Email" type="text" id="email" name="email" placeholder="Enter your @pnw.edu email"/>
                    <Input label="Password" type="password" id="password" name="password" placeholder="Enter your password"/>
                    <input type="submit" value="Login"/>
                    {/* If errorMessage is set, print it to screen*/}
                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                </form>
                
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Don't have an account? Create one!</h1>
                <button> Create a new account </button>
            </div>
        </main>
    );
}