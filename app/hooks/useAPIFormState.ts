import { useCallback, useRef, useState } from "react";
import type { APIData } from "../api/APIResponse";

export default function useAPIFormState<R>(formAction: (data: FormData) => Promise<APIData<R>>): { result: APIData<R> | undefined, formAction: (formData: FormData) => Promise<void>, isPending: boolean } {
    const [result, setResult] = useState<APIData<R>>();
    const [isPending, setIsPending] = useState(false);

    const pendingRef = useRef(false);

    const rFormAction = useCallback(async (formData: FormData): Promise<void> => {

        if (pendingRef.current) return undefined;

        pendingRef.current = true;

        setIsPending(true);

        try {
            
            const res = await formAction(formData);

            setResult(res);

            // return res;

        } catch (err) {

            console.error(err);
            return undefined;

        } finally {

            pendingRef.current = false;
            setIsPending(false);
        }

    }, [formAction]);

    return { result: result, formAction: rFormAction, isPending } as const;
}