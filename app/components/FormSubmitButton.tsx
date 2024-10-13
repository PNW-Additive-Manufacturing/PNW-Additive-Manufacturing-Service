import { useFormStatus } from "react-dom";
import FormLoadingSpinner from "./FormLoadingSpinner";

export default function FormSubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return <button className="flex gap-2" type="submit" disabled={pending}>
        {label}
        <FormLoadingSpinner></FormLoadingSpinner>
    </button>
}
