import { useFormStatus } from "react-dom";
import FormLoadingSpinner from "./FormLoadingSpinner";

export default function FormSubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return <button className="flex items-center gap-2 text-sm py-2.5 font-normal text-inherit" type="submit" disabled={pending}>
        {label}
        <FormLoadingSpinner></FormLoadingSpinner>
    </button>
}
