import "server-only";
import db from "@/app/api/Database";
import { z } from "zod";
import { Figure } from "@/app/components/Figures";

const SEMESTER_RANGES = {
    FALL: [8, 12], // August through December
    SPRING: [1, 5]  // January through May
} as const;

function isMonthInRange(month: number, [start, end]: readonly [number, number]): boolean {
    return month >= start && month <= end;
}

function getSemesterName(date: Date): SemesterName {
    const month = date.getUTCMonth() + 1;

    if (isMonthInRange(month, SEMESTER_RANGES.FALL)) return "fall";
    if (isMonthInRange(month, SEMESTER_RANGES.SPRING)) return "spring";
    return "off-season";
}

type SemesterName = "fall" | "spring" | "off-season";
type SemesterFinances = {
    semesterName: SemesterName;
    year: number;
    walletDepositsInCents: number;
    walletGiftedInCents: number;
    printingExpendituresInCents: number;
};

// Validation schemas
const walletTransactionSchema = z.object({
    paidAt: z.coerce.date(),
    totalPaidInCents: z.coerce.number(),
    customerPaidInCents: z.coerce.number()
});

const printingPaymentSchema = z.object({
    paidAt: z.coerce.date(),
    paidInCents: z.coerce.number().positive()
});

async function fetchSemesterFinances(): Promise<SemesterFinances[]> {
    const walletTransactions = await db`
    SELECT CustomerPaidInCents, AmountInCents, PaidAt 
    FROM WalletTransaction`;

    const printingPayments = await db`
    SELECT totalpriceincents AS PaidInCents, paidat AS PaidAt 
    FROM Request 
    WHERE PaidAt IS NOT NULL AND totalpriceincents > 0`;

    // Process data by semester
    const semesterMap = new Map<string, SemesterFinances>();

    // Process wallet transactions
    for (const raw of walletTransactions) {
        const transaction = walletTransactionSchema.parse({
            paidAt: raw.paidat,
            totalPaidInCents: raw.amountincents,
            customerPaidInCents: raw.customerpaidincents
        });

        const year = transaction.paidAt.getUTCFullYear();
        const semesterName = getSemesterName(transaction.paidAt);
        const key = `${year}-${semesterName}`;

        const existing = semesterMap.get(key);

        if (existing) {
            existing.walletDepositsInCents += transaction.totalPaidInCents;
            existing.walletGiftedInCents += transaction.totalPaidInCents - transaction.customerPaidInCents;
        } else {
            semesterMap.set(key, {
                year,
                semesterName,
                walletDepositsInCents: transaction.totalPaidInCents,
                walletGiftedInCents: transaction.totalPaidInCents - transaction.customerPaidInCents,
                printingExpendituresInCents: 0
            });
        }
    }

    // Process printing payments
    for (const raw of printingPayments) {
        const payment = printingPaymentSchema.parse({
            paidAt: raw.paidat,
            paidInCents: raw.paidincents
        });

        const year = payment.paidAt.getUTCFullYear();
        const semesterName = getSemesterName(payment.paidAt);
        const key = `${year}-${semesterName}`;

        const existing = semesterMap.get(key);

        if (existing) {
            existing.printingExpendituresInCents += payment.paidInCents;
        } else {
            semesterMap.set(key, {
                year,
                semesterName,
                walletDepositsInCents: 0,
                walletGiftedInCents: 0,
                printingExpendituresInCents: payment.paidInCents
            });
        }
    }

    // Convert map to array and sort by year (descending) and semester
    const semesters = Array.from(semesterMap.values());
    const semesterOrder = { fall: 0, spring: 1, "off-season": 2 };

    return semesters.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return semesterOrder[a.semesterName] - semesterOrder[b.semesterName];
    });
}

export default async function SemesterFinancialReport() {
    const semesters = await fetchSemesterFinances();

    return (
        <div className="w-full flex flex-col sm:flex-row gap-4 overflow-x-scroll">
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

                        <Figure
                            amount={(semester.walletDepositsInCents - semester.walletGiftedInCents - semester.printingExpendituresInCents) / 100}
                            prefix="$"
                            name="Estimated Income"
                            style="large"
                            useColors={true}
                        />
                    </div>
                ))
            )}
        </div>
    );
}