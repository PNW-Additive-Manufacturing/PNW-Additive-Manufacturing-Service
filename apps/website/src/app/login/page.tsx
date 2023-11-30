"use client"

import { Input } from '../components/Input';
import { Navbar } from '../components/Navigation'

export default function Login() {
    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full text-center">Login</h1>
                <form>
                    <Input label="Username" type="text" id="user" placeholder="Enter your username"/>
                    <Input label="Password" type="password" id="pass" placeholder="Enter your password"/>
                    <input type="submit" value="Login"/>
                </form>
            </div>
        </main>
    );
}