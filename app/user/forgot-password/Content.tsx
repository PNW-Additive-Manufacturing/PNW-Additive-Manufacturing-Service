"use client"

import { sendPasswordResetEmail } from "@/app/api/server-actions/account";
import { formateDateWithTime } from "@/app/api/util/Constants";
import FormSubmitButton from "@/app/components/FormSubmitButton";
import { Input } from "@/app/components/Input";
import useAPIFormState from "@/app/hooks/useAPIFormState";

export default function Content() {
    let { result, isPending, formAction } = useAPIFormState(sendPasswordResetEmail);


    return <>

        <p className="text-sm lg:text-center">A link to reset your password will be sent to the associated email address.</p>
        <br />
        <div className="py-2 w-full">
            <form action={formAction}>
                <Input
                    label="Purdue Northwest Email"
                    type="text"
                    id="email"
                    required={true}
                    placeholder="leo@pnw.edu"
                />
                <FormSubmitButton label="Reset Password" />
                {result && (!result.success
                    ? <p className="text-red-600">
                        {result.errorMessage}
                    </p>
                    : <p className="text-sm">
                        An email has been sent to you with details on how to reset your password and will expire at <span className="font-semibold">{formateDateWithTime(result.validUntil)}</span>. It may take up to 4 minutes process the email.
                    </p>)
                }
            </form>
            <button>I have the Reset Code</button>
        </div>

    </>
}