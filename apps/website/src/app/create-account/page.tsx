"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation'
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateAccount() {
    let [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    let formHandler = async function (event: any) {
        event.preventDefault(); //NEEDED
        let form = event.target as HTMLFormElement;

        //@ts-ignore
        let email = (form.elements.email.value as string).trim() ?? "";
        //@ts-ignore
        let firstName = (form.elements.firstname.value as string).trim() ?? "";
        //@ts-ignore
        let lastName = (form.elements.lastname.value as string).trim() ?? "";
        //@ts-ignore
        let password = (form.elements.password.value as string).trim() ?? "";
        //@ts-ignore
        let confirmPassword = (form.elements["confirm-password"].value as string).trim() ?? "";
  
        if(password !== confirmPassword) {
            setErrorMessage("Password does not match with Confirm Passwod field!");
            return;
        }

        let jsonResponse: any;
        try {
            jsonResponse = await (await fetch("/api/accounts/createaccount/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    firstname: firstName,
                    lastname: lastName,
                    password: password,
                    permission: "user"
                })
            })).json();
        } catch(e) {
            setErrorMessage("Unable to connect to API to create account!" + e);
            return;
        }

        if(jsonResponse.error) {
            setErrorMessage(jsonResponse.error);
            return;
        }

        //if no errors, account was successfully created

        router.replace("/dashboard/user");
    };

    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Create Account</h1>
                <form method="post" onSubmit={formHandler}>
                    <Input label="PNW Email" type="text" id="user" name="email" placeholder="Enter your @pnw.edu email"/>
                    <Input label="First Name" type="text" id="name1" name="firstname" placeholder="Enter your first name"/>
                    <Input label="Last Name" type="text" id="name2" name="lastname" placeholder="Enter your last name"/>
                    <Input label="Password" type="password" id="pass1" name="password" placeholder="Choose your password"/>
                    <Input label="Confirm Password" type="password" id="pass2" name="confirm-password" placeholder="Confirm your password"/>
                    <input type="submit" value="Create Account"/>
                    {/* If errorMessage is set, print it to screen*/}
                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                </form>
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Already have an account? Login here!</h1>
                <button> Go to Login Screen </button>
            </div>
        </main>
    );
}