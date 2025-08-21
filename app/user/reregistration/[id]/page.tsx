import HorizontalWrap from "@/app/components/HorizontalWrap";
import Reregistration from "../Reregistration";
import { queryAccountReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import { NextResponse } from "next/server";

export default async function Page({ params: { id } }: { params: Record<string, string> }) {

    const JWT = await retrieveSafeJWTPayload();
    if (JWT === null) return NextResponse.redirect("/");

    const spanAccountEntry = await queryAccountReregistration(id, JWT.email);

    if (spanAccountEntry === null) {
        // A registration span with the given ID does not exist!
        return <>Registration #{id} does not exist!</>
    }

    return <>

        <HorizontalWrap className="py-8">
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                {spanAccountEntry.entry !== null ? <>You have already registered!</> : <Reregistration registration={spanAccountEntry} />}
            </div>
        </HorizontalWrap>

    </>
}