import { useFormState } from "react-dom";
import { APIData } from "../api/APIResponse";
import { modifyPart } from "../api/server-actions/maintainer";


// export default function useAPIFormState<R, F extends (data: FormData) => APIData<R> | Promise<APIData<R>>>(formAction: F): [value: ReturnType<F>, formAction: (data: FormData) => void, isPending: boolean]
export default function useAPIFormState<R, F extends (prevState: any, data: FormData) => Promise<APIData<R>> | APIData<R>>(formAction: F): [Awaited<ReturnType<F>> | undefined, (data: FormData) => void, boolean]
{
    let [rValue, action, isPending] = useFormState(formAction as any, undefined!);

    return [rValue as any, action as any, isPending];
}