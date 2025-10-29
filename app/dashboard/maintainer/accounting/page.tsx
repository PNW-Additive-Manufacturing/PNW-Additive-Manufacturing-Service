import HorizontalWrap from "@/app/components/HorizontalWrap";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import FinancialReport from "./FinancialReport";

export default async function Accounting() {

    unstable_noStore();

    return <>
        <HorizontalWrap>
            <div className="py-8 flex flex-col gap-4">
                <h1 className="w-fit text-3xl font-normal">
                    Accounting
                </h1>
                <p>
                    Tracks monetary flows within the 3D printing service across academic semesters. Categorizes transactions by semester (Fall: August-December, Spring: January-May, Off-Season: remaining months) and calculates key financial metrics to ensure operational balance.
                </p>
                <ul>
                    <li><span className="font-bold">Wallet Deposits</span> - The total amount of money deposited into wallets during the semester</li>
                    <li><span className="font-bold">Complimentary Deposits</span> - Complimentary or ghost credits given to users that didn't require actual payment (Not recommended unless actual Gift)</li>
                    <li><span className="font-bold">Printing Costs</span> - Money spent by users on 3D printing services during the semester</li>
                    {/* <li><span className="font-bold">Estimated Income</span> - Estimated revenue after accounting for gifted credits, this value should be trending towards zero.</li> */}
                </ul>
                {/* <p>
                    A non-negative estimated income does NOT mean we have access to that money. At the moment, we do not track user-facing price vs actual costs so this value is unknown.
                </p> */}
            </div>
        </HorizontalWrap>

        <div className="bg-white min-h-screen py-8">
            <HorizontalWrap>

                <Suspense fallback={<>Querying financial Information...</>}>

                    <FinancialReport />

                </Suspense>

            </HorizontalWrap>
        </div>
    </>
}