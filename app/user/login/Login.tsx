"use client";

import { tryLogin } from "@/app/api/server-actions/account";
import FormSubmitButton from "@/app/components/FormSubmitButton";
import { Input } from "@/app/components/Input";
import { useFormState } from "react-dom";

export function Login({ redirect }: { redirect?: string; reason?: string; }) {
    let [error, formAction] = useFormState<string, FormData>(tryLogin, "");

    return (
        <form action={formAction}>
            {redirect && (
                <input
                    id="redirect"
                    name="redirect"
                    hidden
                    readOnly
                    value={redirect}
                />
            )}
            <Input
                label="Purdue Northwest Email"
                type="text"
                id="email"
                required={true}
                placeholder="leo@pnw.edu"
            />
            <Input
                label="Password"
                type="password"
                id="password"
                required={true}
                placeholder="Enter your Password"
            />
            <a href="/user/forgot-password">
                <p className="w-full pb-4 text-sm text-left">
                    Have you forgot your password? Reset it here!
                </p>
            </a>
            <select hidden id="session-duration" defaultValue={"1w"}>
                <option value="1d">Day</option>
                <option value="1w">Week</option>
                <option value="1m">Month</option>
                <option value="1y">Year</option>
            </select>
            <FormSubmitButton className="mb-0" label="Sign In" />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
    );
}