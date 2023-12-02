"use client"

import { Input } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation'

export default function Login() {
    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Login</h1>
                <form>
                    <Input label="PNW Email" type="text" id="user" placeholder="Enter your @pnw.edu email"/>
                    <Input label="Password" type="password" id="pass" placeholder="Enter your password"/>
                    <input type="submit" value="Login"/>
                </form>
            </div>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full pb-4 text-left">Don't have an account? Create one!</h1>
                <button> Create a new account </button>
            </div>
        </main>
    );
}