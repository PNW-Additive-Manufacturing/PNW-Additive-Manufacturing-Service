import { Figure } from "@/app/components/Figures";
import type { SemesterFinances } from "./FinancialReport";

export default async function SemesterFinancialReport({ semesters }: { semesters: SemesterFinances[] }) {

    return (
        <div className="w-full flex flex-col flex-wrap sm:flex-row gap-4 overflow-x-scroll">
            {semesters.length === 0 ? (
                <p>No financial data available for any semester</p>
            ) : (
                semesters.map(semester => (
                    <div
                        className="bg-background p-4 rounded-md flex flex-col gap-2"
                        key={`${semester.year}-${semester.semesterName}`}
                    >
                        <p className="text-lg font-semibold capitalize">
                            {semester.year} {semester.semesterName}
                        </p>

                        {/* Real money deposited */}
                        <Figure
                            amount={(semester.walletDepositsInCents) / 100}
                            prefix="$"
                            name="Wallet Deposits"
                            style="large"
                        />

                        {/* Gifted money */}
                        <Figure
                            amount={semester.walletGiftedInCents / 100}
                            prefix="$"
                            name="Complimentary Deposits"
                            style="large"
                        />

                        {/* Money spent on 3D printing */}
                        <Figure
                            amount={(semester.printingExpendituresInCents / 100)}
                            prefix="$"
                            name="Printing Costs"
                            style="large"
                        />

                        {/* <Figure
                            amount={(semester.walletDepositsInCents - semester.walletGiftedInCents - semester.printingExpendituresInCents) / 100}
                            prefix="$"
                            name="Estimated Income"
                            style="large"
                            useColors={true}
                        /> */}
                        
                    </div>
                ))
            )}
        </div>
    );
}