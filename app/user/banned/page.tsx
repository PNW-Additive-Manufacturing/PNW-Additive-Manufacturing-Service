import ErrorPrompt from "@/app/components/ErrorPrompt";
import HorizontalWrap from "@/app/components/HorizontalWrap";


export default function Banned() {
    return (
        <HorizontalWrap className="py-8">
            <ErrorPrompt code={"Banned"} details="Your access to this service has been revoked, and you are no longer permitted to use it." />
        </HorizontalWrap>
    );
}
