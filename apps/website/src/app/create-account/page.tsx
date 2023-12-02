"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation'

export default function CreateAccount() {
    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Create Account</h1>
                <form>
                    <Input label="PNW Email" type="text" id="user" placeholder="Enter your @pnw.edu email"/>
                    <Input label="First Name" type="text" id="name1" placeholder="Enter your first name"/>
                    <Input label="Last Name" type="text" id="name2" placeholder="Enter your last name"/>
                    <Input label="Password" type="password" id="pass1" placeholder="Choose your password"/>
                    <Input label="Confirm Password" type="password" id="pass2" placeholder="Confirm your password"/>
                    <input type="submit" value="Create Account"/>
                </form>
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Already have an account? Login here!</h1>
                <button> Go to Login Screen </button>
            </div>
        </main>
    );
}