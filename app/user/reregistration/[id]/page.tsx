import { queryAccountReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import Reregistration from "../Reregistration";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const session = await serveRequiredSession();

    const spanAccountEntry = await queryAccountReregistration(params.id, session.account.email);

    if (spanAccountEntry === null) {
        // A registration span with the given ID does not exist!
        return <>Registration #{params.id} does not exist!</>
    }

    return <>

        <HorizontalWrap className="py-8">
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                {spanAccountEntry.entry !== null ? <>You have already registered!</> : <Reregistration registration={spanAccountEntry} name={session.account.firstName} />}
            </div>
        </HorizontalWrap>

    </>
}