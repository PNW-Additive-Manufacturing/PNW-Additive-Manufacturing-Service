import AMSIcon from "@/app/components/AMSIcon";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Login } from "./Login";

export default function Page({ searchParams }: { searchParams: { reason?: string; redirect?: string }; }) {
    const reason = searchParams.reason;
    const redirect = searchParams.redirect;

    return (
        <HorizontalWrap className="py-8">
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                <div className="lg:mx-auto mb-4 w-fit">
                    <AMSIcon />
                </div>
                <h1 className="text-xl mx-auto font-normal w-fit">
                    Sign into Additive Manufacturing Service
                </h1>
                {reason && <p className="text-base mt-4 lg:text-center font-bold">{reason}</p>}
                <br />
                <div className="py-2 w-full">
                    <Login redirect={redirect} reason={reason} />
                </div>
                <a href="/user/create-account">
                    <p className="w-full pb-4 text-sm text-left">
                        Don't have an account? Create one!
                    </p>
                </a>
            </div>
        </HorizontalWrap>
    );
}