import HorizontalWrap from "@/app/components/HorizontalWrap";
import { queryAccountReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { serveRequiredSession } from "@/app/utils/SessionUtils";
import Reregistration from "../Reregistration";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    return <>

        <HorizontalWrap className="py-8">
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">

                <Dynamic id={(await props.params).id} />

            </div>
        </HorizontalWrap>

    </>
}

async function Dynamic({ id }: { id: string })
{
    const session = await serveRequiredSession();
    
    const spanAccountEntry = await queryAccountReregistration(id, session.account.email);
    
    if (spanAccountEntry === null) {
        // A registration span with the given ID does not exist!
        return <>Registration #{id} does not exist!</>
    }

    return <>
        {spanAccountEntry.entry !== null ? <>You have already registered!</> : <Reregistration registration={spanAccountEntry} name={session.account.firstName} />}
    </>
}