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
        <div ref={receiptRef as any} className="hidden print:block">
            <div className="p-12">
                <h1 className="hidden print:block w-fit mb-4 text-2xl font-medium">
                    <span className="text-pnw-gold"> PNW </span>
                    Additive Manufacturing Service
                </h1>

                <div className="flex gap-4 justify-between">
                    <div>
                        <p>Additive Manufacturing Club of PNW</p>
                        <p>pnw3d.com</p>
                    </div>
                    <div>
                        <p className="text-3xl uppercase font-extralight">Receipt</p>
                    </div>
                </div>

                <br />

                <div className="out bg-background">
                    <div className="p-4">
                        <div className="flex justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-medium uppercase">{transaction.accountEmail.split("@").at(0)}</h2>
                                <p className="text-sm">Purchase Method: {transaction.paymentMethod.toUpperCase()}</p>
                                <p className="text-sm">Purchase No: #{transaction.id}</p>
                            </div>

                            <div className="flex gap-12 text-right">
                                <div>
                                    <label>Purchase Information</label>
                                    {transaction.paidAt && <p className="text-sm">{formateDate(transaction.paidAt)}</p>}
                                    <p className="text-sm">{transaction.accountEmail}</p>
                                </div>
                            </div>

                        </div>

                    </div>

                    <table className="hidden print:table w-full mt-2">
                        <thead>
                            <tr>
                                <th className="text-xs">Item</th>
                                <th className="text-xs">Unit Cost</th>
                                <th className="text-xs">Quantity</th>
                                <th className="text-xs text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hidden print:table-row">
                                <td>PNW Additive Manufacturing Service Funds</td>
                                <td>${(transaction.amountInCents / 100).toFixed(2)}</td>
                                <td>1</td>
                                <td className="text-right">${(transaction.amountInCents / 100).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="p-4">

                        <p className="text-sm font-light flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-right w-full text-gray-500">
                                {" "}
                                ${(transaction.amountInCents / 100).toFixed(2)}
                            </span>
                        </p>

                        <p className="text-sm font-light flex justify-between">
                            <span>Tax</span>
                            <span className="text-right w-full text-gray-500">
                                {" "}
                                ${(0).toFixed(2)}
                            </span>
                        </p>

                        <p className="text-xl flex justify-between mt-1">
                            <span className="font-semibold">Total</span>
                            <span className="text-right w-full text-gray-500">
                                {" "}
                                ${(transaction.amountInCents / 100).toFixed(2)}
                            </span>
                        </p>
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