"use client";

import { resetPassword as resetPasswordAction } from "@/app/api/server-actions/account";
import AMSIcon from "@/app/components/AMSIcon";
import FormSubmitButton from "@/app/components/FormSubmitButton";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Input } from "@/app/components/Input";
import useAPIFormState from "@/app/hooks/useAPIFormState";

export default function ResetPassword({ resetCode }: { resetCode: string }) {
    //note that Server component cannot return null or Class objects, only plain JSONs and primitive types
    let resetPasswordForm = useAPIFormState(resetPasswordAction);

    return (
        <HorizontalWrap>
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                <div className="lg:mx-auto mb-4 w-fit">
                    <AMSIcon />
                </div>
                <h1 className="text-xl mx-auto font-normal w-fit">
                    Reset your Password
                </h1>
                <br />
                <div className="py-2 w-full">
                    <form action={resetPasswordForm.formAction}>
                        <input readOnly hidden id="code" name="code" value={resetCode} />
                        <Input
                            label="Password"
                            type="password"
                            id="new-password"
                            required={true}
                            placeholder="Enter your Password"
                        />

                        <FormSubmitButton label="Reset Password" />
                        {resetPasswordForm.result?.success == false && <p className="text-red-600">{resetPasswordForm.result.errorMessage}</p>}
                    </form>
                </div>
            </div>
        </HorizontalWrap>
    );
}