import { formateDate } from "@/app/api/util/Constants";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Label } from "@/app/components/Inputs";
import { RegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { queryAllRegistrationSpans } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { Suspense } from "react";
import AddRegistrationSpanForm from "./AddRegistrationForm";
import RegistrationSpanBlock from "./RegistrationSpanBlock";
import Spinner from "@/app/components/Spinner";
import RegistrationSpanBlocks from "./RegistrationSpanBlocks";

export default async function Accounting() {

    return (
        <>
            <HorizontalWrap>
                <div className="py-8 flex flex-col gap-4">
                    <h1 className="w-fit text-3xl font-normal">
                        Account Reregistration
                    </h1>
                    <p className="text-gray-600">
                        Review and manage user registration activity across defined time periods.
                    </p>
                </div>
            </HorizontalWrap>

            <div className="bg-white min-h-screen py-8">
                <HorizontalWrap>
                    <h2 className="text-xl font-medium mb-4">Registration Periods</h2>

                    <div className="grid grid-cols-1 gap-4 w-full lg:w-2/3 xl:w-1/2">

                        <AddRegistrationSpanForm />

                        <Suspense fallback={<div className="bg-background p-4 rounded-md shadow-sm flex justify-between items-center gap-4">
                            Fetching Spans
                            <div className="w-5 h-5"><Spinner /></div>
                        </div>}>

                            <RegistrationSpanBlocks />

                        </Suspense>

                    </div>
                </HorizontalWrap>
            </div>
        </>
    );
}
