import { queryAccountReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { redirect } from "next/navigation";
import Reregistration from "../Reregistration";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const JWT = await retrieveSafeJWTPayload();
    if (JWT === null) redirect("/");

    const spanAccountEntry = await queryAccountReregistration(params.id, JWT.email);

    if (spanAccountEntry === null) {
        // A registration span with the given ID does not exist!
        return <>Registration #{params.id} does not exist!</>
    }

    return <>

        <HorizontalWrap className="py-8">
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                {spanAccountEntry.entry !== null ? <>You have already registered!</> : <Reregistration registration={spanAccountEntry} name={JWT.firstname} />}
            </div>
        </HorizontalWrap>

    </>
}