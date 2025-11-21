import db from "@/app/api/Database";
import { Figure } from "@/app/components/Figures";
import "server-only";
import { z } from "zod";
import SemesterFinancialReport from "./SemesterFinancialReport";

const SEMESTER_RANGES = {
    FALL: [8, 12], // August through December
    SPRING: [1, 5]  // January through May
} as const;

function isMonthInRange(month: number, [start, end]: readonly [number, number]): boolean {
    return month >= start && month <= end;
}

function getSemesterName(date: Date): SemesterName {
    const month = date.getUTCMonth();

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

const outstandingAccountSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    outstandingBalanceInCents: z.coerce.number().int()
});

type OutstandingAccount = z.infer<typeof outstandingAccountSchema>;

async function fetchFinances(): Promise<{ semesters: SemesterFinances[], allTimeWalletCustomerDepositedInCents: number, allTimeRequestExpenseInCents: number, allTimeComplimentaryDepositsInCents: number, outstandingAccounts: OutstandingAccount[] }> {
    const walletTransactions = await db`
    SELECT CustomerPaidInCents, AmountInCents, PaidAt 
    FROM WalletTransaction`;

    const printingPayments = await db`
    SELECT totalpriceincents AS PaidInCents, paidat AS PaidAt 
    FROM Request 
    WHERE PaidAt IS NOT NULL AND totalpriceincents > 0`;

    const outstandingAccounts = (await db`
    SELECT a.Email, a.FirstName, a.LastName, COALESCE(wt.TotalWallet, 0) - COALESCE(r.TotalRequests, 0) AS BalanceInCents
    FROM Account a
    LEFT JOIN (SELECT AccountEmail, SUM(AmountInCents) AS TotalWallet FROM WalletTransaction WHERE Status = 'paid' GROUP BY AccountEmail) wt ON wt.AccountEmail = a.Email
    LEFT JOIN (SELECT OwnerEmail, SUM(TotalPriceInCents) AS TotalRequests FROM Request WHERE PaidAt IS NOT NULL GROUP BY OwnerEmail) r ON r.OwnerEmail = a.Email
    WHERE COALESCE(wt.TotalWallet, 0) - COALESCE(r.TotalRequests, 0) < 0
    ORDER BY BalanceInCents ASC;`).map<OutstandingAccount>(q => outstandingAccountSchema.parse({ 
        email: q.email, 
        name: `${q.firstname} ${q.lastname}`, 
        outstandingBalanceInCents: q.balanceincents  
    }));

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
        outstandingAccounts,
        allTimeWalletCustomerDepositedInCents,
        allTimeRequestExpenseInCents,
        allTimeComplimentaryDepositsInCents
    }
}

export default async function FinancialReport() {

    const { semesters, allTimeWalletCustomerDepositedInCents, allTimeRequestExpenseInCents, allTimeComplimentaryDepositsInCents, outstandingAccounts } = await fetchFinances();

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
        <p className="text-sm mt-1">Deposits and wholeness tracked each Semester (ex: Fall, Spring, Summer)</p>

        <br />

        <SemesterFinancialReport semesters={semesters} />

        <br />

        <h1 className="text-xl">
            Outstanding Accounts ({outstandingAccounts.length})
        </h1>
        <p className="text-sm mt-1">Accounts with outstanding Balances</p>

        <br />

        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {outstandingAccounts.map(a => <>
            
                <div className="bg-background p-4 rounded-md gap-6 text-base">

                    <p>{a.name}</p>
                    <Figure amount={a.outstandingBalanceInCents / 100} prefix={"$"} name="Outstanding Balance" style="inline" />
                    
                </div>
            
            </>)}

        </div>


    </>
}