import { queryAllRegistrationSpans } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import RegistrationSpanBlock from "./RegistrationSpanBlock";


export default async function RegistrationSpanBlocks() {
    const spans = await queryAllRegistrationSpans();

    return <>

        {spans.map((s) => (
            <div key={s.id} className="bg-background p-4 rounded-md shadow-sm">

                <RegistrationSpanBlock span={s} />

            </div>
        ))}
    </>
}