// import { queryAccountReregistration } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
// import { serveRequiredSession } from "@/app/utils/SessionUtils";
// import Reregistration from "../Reregistration";

// export default async function Dynamic({ id }: { id: string })
// {
//     const session = await serveRequiredSession();
    
//     const spanAccountEntry = await queryAccountReregistration(id, session.account.email);
    
//     if (spanAccountEntry === null) {
//         // A registration span with the given ID does not exist!
//         return <>Registration #{id} does not exist!</>
//     }

//     return <>
//         {spanAccountEntry.entry !== null ? <>You have already registered!</> : <Reregistration registration={spanAccountEntry} name={session.account.firstName} />}
//     </>
// }