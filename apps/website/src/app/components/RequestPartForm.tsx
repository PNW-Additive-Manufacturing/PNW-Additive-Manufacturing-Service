"use client"

import { useFormState, useFormStatus } from "react-dom";
import { requestPart } from "@/app/api/server-actions/request-part";


function SubmitButton() {
  let {pending} = useFormStatus();
  return (
      <div className="bg-white rounded-sm font-semibold p-14 pt-0 pb-10 w-full">
          <input type="submit" value={pending ? "Submitting Request..." : "Submit Request"}/>
      </div>
  )
}


//TODO: Make this work for more generic forms
export function RequestPartForm({children} : {children: any}) : JSX.Element {
  let [error, formAction] = useFormState<string, FormData>(requestPart, "");

  return (
    <form action={formAction}>
      <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
        {children}
        <p className="text-sm text-red-500">{error}</p>

        <SubmitButton/>
      </div>
    </form>
  )
}