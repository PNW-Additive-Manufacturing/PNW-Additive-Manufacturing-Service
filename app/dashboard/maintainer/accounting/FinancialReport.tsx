import "server-only";
import db from "@/app/api/Database";
import { z } from "zod";
import { Figure } from "@/app/components/Figures";
import { Suspense } from "react";
import SemesterFinancialReport from "./SemesterFinancialReport";

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
export type SemesterFinances = {
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

async function fetchFinances(): Promise<{ semesters: SemesterFinances[], allTimeWalletCustomerDepositedInCents: number, allTimeRequestExpenseInCents: number, allTimeComplimentaryDepositsInCents: number }> {
    const walletTransactions = await db`
    SELECT CustomerPaidInCents, AmountInCents, PaidAt 
    FROM WalletTransaction`;

    const printingPayments = await db`
    SELECT totalpriceincents AS PaidInCents, paidat AS PaidAt 
    FROM Request 
    WHERE PaidAt IS NOT NULL AND totalpriceincents > 0`;

    // Process data by semester
    const semesterMap = new Map<string, SemesterFinances>();
    let allTimeComplimentaryDepositsInCents = 0;
    let allTimeWalletCustomerDepositedInCents = 0;
    let allTimeRequestExpenseInCents = 0;

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

        allTimeWalletCustomerDepositedInCents += transaction.customerPaidInCents;
        allTimeComplimentaryDepositsInCents += transaction.totalPaidInCents - transaction.customerPaidInCents;

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

        allTimeRequestExpenseInCents += payment.paidInCents;

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

    return {
        semesters: semesters.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return semesterOrder[a.semesterName] - semesterOrder[b.semesterName];
        }),
        allTimeWalletCustomerDepositedInCents,
        allTimeRequestExpenseInCents,
        allTimeComplimentaryDepositsInCents
    }
}

export default async function FinancialReport() {

    const { semesters, allTimeWalletCustomerDepositedInCents, allTimeRequestExpenseInCents, allTimeComplimentaryDepositsInCents } = await fetchFinances();

    return <>

        <div className="flex gap-x-8 gap-y-4 flex-wrap">

            <Figure amount={allTimeWalletCustomerDepositedInCents / 100} prefix={"$"} name="All-Time Wallet Deposits" style="inline" />
            <Figure amount={allTimeComplimentaryDepositsInCents / 100} prefix={"$"} name="All-Time Complimentary Deposits" style="inline" />
            <Figure amount={allTimeRequestExpenseInCents / 100} prefix={"$"} name="All-Time Printing Costs" style="inline" />

        </div>

        <br />

        <h1 className="text-xl">
            Semester Financial Reportings
        </h1>

        <br />

        <SemesterFinancialReport semesters={semesters} />

    </>
}