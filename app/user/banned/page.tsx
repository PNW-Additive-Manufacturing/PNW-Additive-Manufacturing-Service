import ErrorPrompt from "@/app/components/ErrorPrompt";


export default function Banned() {
    return (
        <ErrorPrompt code={"Banned"} details="Your access to this service has been revoked, and you are no longer permitted to use it." />
    );
}
