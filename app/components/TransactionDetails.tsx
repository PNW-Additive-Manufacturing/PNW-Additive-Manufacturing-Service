"use client";

import { formateDate } from "@/app/api/util/Constants";
import Table from "@/app/components/Table";
import { WalletTransaction, WalletTransactionPaymentMethod, WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import { RegularCirclePlus } from "lineicons-react";
import Link from "next/link";
import { MutableRefObject, useRef } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import Account from "../Types/Account/Account";
import { PDFViewer } from "@react-pdf/renderer";
import { WalletTransactionReceiptPDF } from "../PDFs/Receipt";

export default function TransactionDetails({ transaction }: { transaction: WalletTransaction & Account }) {
    return <>

        {/* PDF Information */}
        {/* <div ref={receiptRef as any} className="bg-white">
            <div className="p-12">
                <h1 className="flex gap-4 items-center justify-between w-full mb-4 text-2xl font-medium">
                    <div>
                        <span className="text-pnw-gold"> PNW </span>
                        Additive Manufacturing Service
                    </div>
                    <div className="w-10">
                        <Image src={"/assets/am_cropped.png"} alt={"Additive Manufacturing"} width={480} height={480}></Image>
                    </div>
                </h1>

                <p>Additive Manufacturing Club of PNW</p>
                <p>2200 169th St, Hammond, IN 46323 (Design Studio)</p>
                <p>For contact information, visit the team page at <span className="underline">pnw3d.com</span>.</p>

                <hr />

                <h2 className="text-lg mb-2 font-medium">Receipt (#{transaction.id}):</h2>

                <div className="flex gap-12">
                    <div>
                        <p className="mb-1">Payment Information:</p>
                        <p className="text-sm">Payment Status: <span className="font-bold">{transaction.paymentStatus.toUpperCase()}</span></p>
                        <p className="text-sm">Payment Method: <span className="font-bold">{transaction.paymentMethod.toUpperCase()}</span></p>
                        {transaction.paidAt && <p className="text-sm">Date: <span className="font-bold">{formateDate(transaction.paidAt)}</span></p>}
                    </div>
                    <div>
                        <p className="mb-1 text-base">Customer:</p>
                        <p className="text-sm">Name: <span className="font-bold">{transaction.firstName} {transaction.lastName}</span></p>
                        <p className="text-sm">Email: <span className="font-bold uppercase">{transaction.accountEmail}</span></p>
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

                    <div className="p-4 mb-4">

                        <p className="text-sm font-light flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-right w-full"> ${(transaction.amountInCents / 100).toFixed(2)}</span>
                        </p>

                        <p className="text-sm font-light flex justify-between">
                            <span>Tax</span>
                            <span className="text-right w-full">${(0).toFixed(2)}</span>
                        </p>

                        <p className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-right w-full">${(transaction.amountInCents / 100).toFixed(2)}</span>
                        </p>

                        {transaction.paidAt && <p className="flex justify-between font-semibold">
                            <span className="text-nowrap">Paid by Customer</span>
                            <span className="text-right w-full">${(transaction.customerPaidInCents / 100).toFixed(2)}</span>
                        </p>}
                    </div>

                </div>

            </div>
        </div> */}

        <div
            id={`transaction-${transaction.id}`}
            className={`w-full px-4 py-4 outline outline-1 ${transaction.paymentStatus ==
                WalletTransactionStatus.Paid
                ? "outline-gray-300"
                : "outline-yellow-700"
                } bg-white rounded-md flex justify-between items-center target:bg-yellow-50`}>
            <div className="flex text-md items-center">
                {transaction.paymentStatus ==
                    WalletTransactionStatus.Paid ? (
                    <RegularCirclePlus className="h-5 w-auto fill-green-600 mr-2"></RegularCirclePlus>
                ) : (
                    <RegularCirclePlus className="h-5 w-auto fill-yellow-700 mr-2"></RegularCirclePlus>
                )}
                ${(transaction.amountInCents / 100).toFixed(2)}
            </div>
            <div className="flex gap-4 items-center">
                {transaction.paymentMethod != WalletTransactionPaymentMethod.Gift && <a href={`/api/download/receipt?transactionId=${transaction.id}`} target="_blank" className="text-sm bg-gray-50 rounded-lg px-3 py-1 fill-black hover:text-pnw-gold hover:fill-pnw-gold hover:cursor-pointer">
                    Download Receipt<FaRegFilePdf className="fill-inherit ml-2 inline"></FaRegFilePdf>
                </a>}
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