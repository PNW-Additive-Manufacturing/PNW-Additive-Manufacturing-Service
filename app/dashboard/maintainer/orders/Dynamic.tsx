import RequestsTable from "@/app/components/RequestsTable";
import { serveRequiredSession } from "@/app/utils/SessionUtils";

export default async function Dynamic()
{
    const session = await serveRequiredSession();

    return <>
    
        <RequestsTable requestsPerPage={11} session={session.account} />
    
    </>
}