import { useCallback, useState } from "react";
import { APIData, resError } from "../api/APIResponse";
import FormSubmitButton from "./FormSubmitButton";

type APIFormProps<T> = React.PropsWithChildren<{
    action: (formData: FormData) => Promise<APIData<T>>,
    onRes?: (result: APIData<T>) => void, // Generic on response handler.
    successMessage?: (data: T) => React.ReactElement, // Easily display custom success messages.
    submitLabel?: string // Label for the submit button - no button will be auto-included if not provided.
}>

export default function APIForm<T>({ children, action, onRes, submitLabel, successMessage }: APIFormProps<T>) {
    const [result, setResult] = useState<APIData<T> | undefined>(undefined);

    const submitAPI = useCallback(async (formData: FormData) => {

        try {
            const apiResult = await action(formData);

            setResult(apiResult);
            onRes?.(apiResult);
        }
        catch (error) {
            console.error(error);
            setResult(resError("An internal error occurred! Check dev-tools/inspect."));
        }

    }, [action, onRes]);

    return <form action={submitAPI}>

        {children}

        {result && (result.success
            ? (successMessage && <p className="text-sm mb-4">{successMessage(result)}</p>)
            : <p className="text-warning text-sm mb-4">{result?.errorMessage === undefined ? "An unknown issue has occurred!" : `An issue has occurred: ${result?.errorMessage}`}</p>)}

        {submitLabel && <FormSubmitButton label={submitLabel} />}

    </form>
}