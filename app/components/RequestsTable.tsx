"use client";

import {
    getRequestStatus,
    getRequestStatusColor,
    hasQuote,
    isAnyPartDenied,
    RequestWithParts
} from "@/app/Types/Request/Request";
import Table from "@/app/components/Table";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "@/app/ContextProviders";
import { APIData } from "@/app/api/APIResponse";
import { Input, InputCheckbox } from "@/app/components/Input";
import DropdownSection from "@/app/components/DropdownSection";
import {
    RegularArrowLeft,
    RegularArrowRight,
    RegularExit,
    RegularMagnifier,
    RegularSpinnerSolid
} from "lineicons-react";
import { isAllComplete, isAllPending } from "@/app/Types/Part/Part";
import { formateDate } from "@/app/api/util/Constants";
import Timeline from "@/app/components/Timeline";
import ModelViewer from "@/app/components/ModelViewer";
import Link from "next/link";
import RequestPricing from "@/app/components/Request/Pricing";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { redirect } from "next/navigation";

const requestsPerPage = 10;

export default function RequestsTable({ accountEmail }: { accountEmail?: string }) {

    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [includeFulfilled, setIncludeFulfilled] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [requests, setRequests] = useState<RequestWithParts[]>();
    const [selectedRequest, setSelectedRequest] = useState<number>();

    function fetchRequests() {
        setIsFetchingRequests(true);

        fetch("/api/requests", {
            method: "POST",
            cache: "default",
            body: JSON.stringify({
                accountEmail: accountEmail,
                requestedAfter: undefined,
                includeFulfilled: includeFulfilled,
                requestsPerPage: requestsPerPage,
                page: pageNum
            })
        })
            .then((res) => res.json())
            .then((data: APIData<{ requests?: RequestWithParts[] }>) => {
                if (!data.success) throw new Error(data.errorMessage);
                data.requests!.forEach((r) => {
                    r.submitTime = new Date(r.submitTime);
                    if (hasQuote(r))
                        r.quote!.paidAt = new Date(r.quote!.paidAt);
                });
                setRequests(data.requests);
            })
            .catch((err) => console.error(err))
            .finally(() => setIsFetchingRequests(false));
    }

    useEffect(() => fetchRequests(), [pageNum, includeFulfilled]);

    return (
        <>
            {requests == null ? (
                <div className="flex gap-2 items-center">
                    Fetching Requests 
                    <RegularSpinnerSolid className={`inline-block h-auto w-auto animate-spin fill-black`}/>
                </div>
            ) : requests.length == 0 ? (
                <>You do not have any ongoing orders!</>
            ) : (
                <>
                    <Table>
                        <thead>
                            <tr>
                                <th>Requested At</th>
                                {accountEmail == null && <th>Requester</th>}
                                <th>Request</th>
                                <th>Status</th>
                                <th>Cost</th>

                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => (
                                <>
                                    <tr
                                        onClick={() => setSelectedRequest(r.id)}
                                        className={`w-full border-l-4`}
                                        style={{
                                            borderLeftColor:
                                                getRequestStatusColor(r)
                                        }}>
                                        <td className="max-lg:hidden">
                                            {r.submitTime.toLocaleDateString(
                                                "en-us",
                                                {
                                                    weekday: "long",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }
                                            )}
                                        </td>
                                        {accountEmail == null && <td>{r.firstName} {r.lastName}</td>}
                                        <td>{r.name}</td>
                                        <td
                                            style={{
                                                color: getRequestStatusColor(r)
                                            }}>
                                            {getRequestStatus(r)}
                                        </td>
                                        <td>
                                            {hasQuote(r) &&
                                                `$${(
                                                    r.quote!.totalPriceInCents /
                                                    100
                                                ).toFixed(2)}`}
                                        </td>
                                        <td>
                                            <div className="ml-auto w-fit">
                                                <Link
                                                    href={accountEmail == null ? `/dashboard/maintainer/orders/${r.id}` : `/dashboard/user/${r.id}`}>
                                                    <button className="shadow-sm w-fit mb-0 outline outline-1 outline-gray-300 bg-white text-black fill-black flex flex-row gap-2 justify-end items-center px-3 py-2">
                                                        <span className="text-sm">
                                                            {accountEmail == null ? "Manage Request" : "View Request"}
                                                        </span>
                                                        <RegularMagnifier></RegularMagnifier>
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </Table>
                    {/* Controls */}
                    <div className="flex max-lg:gap-4 max-lg:flex-col justify-between lg:px-4 lg:pr-8 py-4">
                        <div className="flex gap-6 items-center">
                            <div className="flex justify-between gap-2 fill-white">
                                <button
                                    className="mb-0 shadow-sm"
                                    disabled={isFetchingRequests || pageNum < 2}
                                    onClick={() => setPageNum(pageNum - 1)}>
                                    <RegularArrowLeft></RegularArrowLeft>
                                </button>
                                <button
                                    className="mb-0 shadow-sm"
                                    disabled={
                                        isFetchingRequests ||
                                        requests.length < requestsPerPage
                                    }
                                    onClick={() => setPageNum(pageNum + 1)}>
                                    <RegularArrowRight></RegularArrowRight>
                                </button>
                            </div>
                            <p>
                                Viewing {requests.length} results on Page{" "}
                                {pageNum}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {isFetchingRequests && (
                                <RegularSpinnerSolid
                                    className={`inline-block h-auto w-auto animate-spin fill-black`}
                                />
                            )}
                            <InputCheckbox
                                label={"Include Fulfilled"}
                                id={"includeFulfilled"}
                                defaultChecked={false}
                                onChange={(v) =>
                                    setIncludeFulfilled(v.currentTarget.checked)
                                }></InputCheckbox>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
