import { useMemo, useState } from "react";
import { APIData } from "../api/APIResponse";
import FormSubmitButton from "./FormSubmitButton";

type APIFormProps<T> = React.PropsWithChildren<{
    action: (formData: FormData) => Promise<APIData<T>>,
    onRes?: (result: APIData<T>) => void,
    submitLabel?: string
}>

export default function APIForm<T>({ children, action, onRes, submitLabel }: APIFormProps<T>) {
    const [result, setResults] = useState<APIData<T> | undefined>(undefined);

    // TODO: Set to a memo.
    async function submitAPI(formData: FormData) {
        const givenResult = await action(formData);
        setResults(givenResult);

        if (onRes !== undefined) onRes(givenResult);
    }

    return <form action={submitAPI}>

        {children}

        {result && !result.success && <p>An issue occurred{result.errorMessage !== undefined && `: ${result.errorMessage}`}</p>}

        {submitLabel && <FormSubmitButton label={submitLabel} />}

    </form>
}