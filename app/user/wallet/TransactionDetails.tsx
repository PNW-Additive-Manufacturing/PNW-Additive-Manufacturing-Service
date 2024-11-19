"use client";

import { formateDate } from "@/app/api/util/Constants";
import Table from "@/app/components/Table";
import { WalletTransaction, WalletTransactionPaymentMethod, WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import { RegularCirclePlus } from "lineicons-react";
import Link from "next/link";
import { useRef } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";

export default function TransactionDetails({ transaction }: { transaction: WalletTransaction }) {
    const receiptRef = useRef<HTMLElement>();
    const handlePrint = useReactToPrint({
        contentRef: receiptRef as any,
        documentTitle: "PNW Additive Manufacturing Service Receipt"
    });

    return <>

        {/* PDF Information */}
        <div ref={receiptRef as any} className="bg-white hidden print:block">
            <div className="p-12">
                <h1 className="w-fit mb-4 text-2xl font-medium">
                    <span className="text-pnw-gold"> PNW </span>
                    Additive Manufacturing Service
                </h1>

                <p>Additive Manufacturing Club of PNW</p>
                <p>2233 171st St, Hammond, IN 46323 (Design Studio)</p>
                <p>For contact information, visit the team page at pnw3d.com.</p>

                <div className="p-6 bg-background rounded-md mt-6">

                    <h2 className="text-lg mb-2 font-medium">Transaction Details (#{transaction.id}):</h2>

                    <div className="flex gap-12">
                        <div>
                            <p className="font-medium mb-0.5">Payment Information:</p>
                            <p className="text-sm">Payment Status: <span className="font-medium">{transaction.paymentStatus.toUpperCase()}</span></p>
                            <p className="text-sm">Payment Method: <span className="font-medium">{transaction.paymentMethod.toUpperCase()}</span></p>
                            {transaction.paidAt && <p className="text-sm">Date: <span className="font-medium">{formateDate(transaction.paidAt)}</span></p>}
                        </div>
                        <div>
                            <p className="font-medium mb-0.5">Customer:</p>
                            <p className="text-sm">Email: <span className="font-medium uppercase">{transaction.accountEmail}</span></p>
                        </div>
                    </div>

                    <div className="out">
                        <table className="w-full mt-6">
                            <thead>
                                <tr>
                                    <th className="text-xs w-1/3 pt-4">Item</th>
                                    <th className="text-xs w-1/3 pt-4">Amount</th>
                                    <th className="text-xs w-1/3 pt-4">Quantity</th>
                                    <th className="text-xs pt-4">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-sm">Additive Manufacturing Service Funds</td>
                                    <td className="text-sm">${(transaction.amountInCents / 100).toFixed(2)}</td>
                                    <td className="text-sm">1</td>
                                    <td className="text-sm">${(transaction.amountInCents / 100).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="p-4 mb-2">

                            <p className="text-sm font-light flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-right w-full"> ${(transaction.amountInCents / 100).toFixed(2)}</span>
                            </p>

                            <p className="text-sm font-light flex justify-between">
                                <span>Tax</span>
                                <span className="text-right w-full"> ${(0).toFixed(2)}</span>
                            </p>

                            <p className="text-xl flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-right w-full">
                                    {" "}
                                    ${(transaction.amountInCents / 100).toFixed(2)}
                                </span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div >

        <div
            className={`w-full px-4 py-4 outline outline-1 ${transaction.paymentStatus ==
                WalletTransactionStatus.Paid
                ? "outline-gray-300"
                : "outline-yellow-700"
                } bg-white rounded-md flex justify-between items-center`}>
            <div className="flex text-md items-center">
                {transaction.paymentStatus ==
                    WalletTransactionStatus.Paid ? (
                    <RegularCirclePlus className="h-5 w-auto fill-green-600 mr-2"></RegularCirclePlus>
                ) : (
                    <RegularCirclePlus className="h-5 w-auto fill-yellow-700 mr-2"></RegularCirclePlus>
                    // <RegularQuestionCircle className="h-7 w-auto fill-gray-500 mr-2"></RegularQuestionCircle>
                )}
                ${(transaction.amountInCents / 100).toFixed(2)}
            </div>
            <div className="flex gap-4 items-center">
                {transaction.paymentMethod != WalletTransactionPaymentMethod.Gift && <div className="text-sm bg-gray-50 rounded-lg px-3 py-1 fill-black hover:text-pnw-gold hover:fill-pnw-gold hover:cursor-pointer" onClick={() => handlePrint()}>
                    Download Receipt<FaRegFilePdf className="fill-inherit ml-2 inline"></FaRegFilePdf>
                </div>}
                <div className="text-sm">
                    {transaction.paymentStatus ==
                        WalletTransactionStatus.Paid ? (
                        <>
                            {transaction.paymentMethod.toUpperCase()}{" "}
                            On{" "}
                            {transaction.paidAt!.toLocaleDateString(
                                "en-us",
                                {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric"
                                }
                            )}
                        </>
                    ) : transaction.paymentStatus ==
                        WalletTransactionStatus.Cancelled ? (
                        "Cancelled"
                    ) : (
                        <Link href="/api/purchase/wallet">
                            <button className="max-lg:w-full mb-0 lg:mb-0 px-3 py-2 text-sm bg-yellow-700">
                                Complete Transaction
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>

    </>
}