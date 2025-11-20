import { WalletTransaction, WalletTransactionPaymentMethod, WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import classNames from "classnames";
import { RegularCirclePlus } from "lineicons-react";
import { FaRegFilePdf } from "react-icons/fa";
import { formateDate } from "../api/util/Constants";

export default function TransactionDetails({ transaction }: { transaction: WalletTransaction }) {
    return <>

        <div id={`wallet-transaction-${transaction.id}`} className={`w-full px-4 py-4 outline outline-1 ${(transaction.paymentStatus == WalletTransactionStatus.Paid ? "outline-gray-300" : "outline-yellow-700")} bg-white rounded-md flex justify-between items-center target:bg-yellow-50`}>
            
            <div className="flex text-md items-center">

                <RegularCirclePlus className={classNames("h-5 w-auto mr-2", transaction.paymentStatus == WalletTransactionStatus.Paid ? "fill-green-600" : "fill-yellow-700")} />

                ${(transaction.amountInCents / 100).toFixed(2)}

            </div>

            <div className="flex gap-4 items-center">

                {transaction.paymentMethod != WalletTransactionPaymentMethod.Gift && <>
                
                    <a href={`/api/download/wallet-receipt?transactionId=${transaction.id}`} target="_blank" className="text-sm bg-gray-50 rounded-lg px-3 py-1 fill-black hover:text-pnw-gold hover:fill-pnw-gold hover:cursor-pointer">
                        Download Receipt <FaRegFilePdf className="fill-inherit ml-2 inline" />
                    </a>
                
                </>}

                <div className="text-sm">

                    {transaction.paidAt && <>{transaction.paymentMethod.toUpperCase()}{" "} On{" "} {formateDate(transaction.paidAt!)}</>}
                    {transaction.paymentStatus == WalletTransactionStatus.Cancelled && <>Cancelled</>}
                    {transaction.paymentStatus == WalletTransactionStatus.Pending && <>Pending</>}

                </div>

            </div>
        </div>

    </>
}