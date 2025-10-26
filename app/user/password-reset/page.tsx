import AMSIcon from "@/app/components/AMSIcon";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import Link from "next/link";

export default function Page() {
    return <>

        <HorizontalWrap>
            <div className="w-full lg:w-1/3 lg:mx-auto shadow-mdk">
                <div className="lg:mx-auto mb-4 w-fit">
                    <AMSIcon />
                </div>
                <h1 className="text-xl mx-auto font-normal w-fit">
                    Your password has been Reset
                </h1>
                <p className="text-center mt-2">
                    Your password has been successfully reset. You can now <Link className="underline" href={"/user/login"}>log in</Link> using your new password.
                </p>
            </div>
        </HorizontalWrap>    
    </>
}