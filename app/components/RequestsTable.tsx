"use client";

import { getRequestStatus, getRequestStatusColor, hasQuote, isPrintingOnMachines, RequestWithParts } from "@/app/Types/Request/Request";
import Table from "@/app/components/Table";
import { useContext, useEffect, useState, useTransition } from "react";
import { APIData } from "@/app/api/APIResponse";
import { InputCheckbox } from "@/app/components/Input";
import Link from "next/link";
import ControlButton from "./ControlButton";
import { AiOutlineReload } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import StatusPill from "./StatusPill";
import usePrinters from "../hooks/usePrinters";
import { AccountContext } from "../ContextProviders";
import { MachineData } from "./Machine";
import { AccountPermission } from "../Types/Account/Account";
import { FiActivity } from "react-icons/fi";

const requestsPerPage = 12;

export default function RequestsTable({ accountEmail }: { accountEmail?: string }) {

    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [includeFulfilled, setIncludeFulfilled] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [requests, setRequests] = useState<RequestWithParts[]>();
    const [selectedRequest, setSelectedRequest] = useState<number>();

    const authContext = useContext(AccountContext);

    let machines: MachineData[] | undefined = undefined;
    if (authContext.isSingedIn && authContext.account!.permission != AccountPermission.User) {
        const printersHook = usePrinters(false);
        machines = printersHook.machines;
    }

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
                <div className="w-full bg-gray-100 min-h-28 rounded-md mb-4" />
            ) : requests.length === 0 ? (
                <div className="w-full bg-gray-100 min-h-28 rounded-md mb-4" />
            ) : (
                <>
                    <Table>
                        <thead>
                            <tr>
                                <th className="w-fit max-lg:hidden" style={{ paddingRight: "0px" }}>#</th>
                                <th className="max-lg:hidden">Requested On</th>
                                {accountEmail == null && <th className="max-lg:hidden">Requester</th>}
                                <th>Request Name</th>
                                <th>Status</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r, i) => {
                                const rowLink = accountEmail == null ? `/dashboard/maintainer/orders/${r.id}` : `/dashboard/user/${r.id}`;

                                return <>
                                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                                    <tr
                                        key={r.id}
                                        onClick={() => setSelectedRequest(r.id)}
                                        className={"w-full border-l-4 out bg-white"}
                                        style={{
                                            borderLeftColor:
                                                getRequestStatusColor(r)
                                        }}>
                                        <td className="w-fit max-lg:hidden" style={{ paddingRight: "0px" }}>
                                            <Link href={rowLink}>{i + 1}</Link>
                                        </td>
                                        <td className="max-lg:hidden">
                                            <Link href={rowLink}>
                                                {r.submitTime.toLocaleDateString(
                                                    "en-us",
                                                    {
                                                        weekday: "long",
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </Link>
                                        </td>
                                        {accountEmail == null && <td className="max-lg:hidden"><Link href={rowLink}>{r.firstName} {r.lastName}</Link></td>}
                                        <td><Link href={rowLink}>{r.name}</Link></td>
                                        <td>
                                            <Link className="flex items-center gap-4" href={rowLink}>
                                                <StatusPill context={getRequestStatus(r)} statusColor={getRequestStatusColor(r)}></StatusPill>
                                            </Link>
                                        </td>
                                        <td>
                                            <Link href={rowLink}> {hasQuote(r) ?
                                                `$${(
                                                    r.quote!.totalPriceInCents /
                                                    100
                                                ).toFixed(2)}` : "Unquoted"}</Link>
                                        </td>
                                        {machines && machines.length > 0 && isPrintingOnMachines(r, machines) &&
                                            <td className="bg-pnw-gold-light">{<span className="font-light"><FiActivity className="inline stroke-pnw-gold" style={{ marginBottom: "3px" }} /> Printing on Machine</span>}</td>}

                                        {/* <td>
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
                                        </td> */}
                                    </tr>
                                </>
                            })}
                        </tbody>
                    </Table>
                </>
            )}

            {/* Controls */}
            <div className="flex flex-wrap max-lg:gap-4 max-lg:flex-col justify-between mt-4">
                <div className="flex flex-wrap items-center gap-4">
                    <ControlButton className={`max-lg:hidden flex gap-2 items-center mb-0`} disabled={isFetchingRequests} onClick={() => fetchRequests()}>
                        <span>Refresh</span>
                        <AiOutlineReload className={`${isFetchingRequests && "animate-spin"} font-bold inline-block fill-white`}></AiOutlineReload>
                    </ControlButton>

                    {(requests != null && requests.length != 0) ? <div className="flex max-lg:mt-4 max-lg:flex-col gap-4 lg:items-center">
                        <div className="flex items-center justify-between gap-2 fill-white">
                            <ControlButton disabled={isFetchingRequests || pageNum < 2} onClick={() => setPageNum(pageNum - 1)} className="m-0 p-0 flex gap-2 items-center">
                                <FaArrowLeft />
                                Previous
                            </ControlButton>
                            <ControlButton disabled={isFetchingRequests || requests!.length < requestsPerPage} onClick={() => setPageNum(pageNum + 1)} className="flex gap-2 items-center">
                                Next
                                <FaArrowRight />
                            </ControlButton>
                        </div>
                        <p>
                            {requests!.length} {requests!.length == 1 ? "Request" : "Requests"} on Page{" "}
                            {pageNum}
                        </p>
                    </div> : accountEmail == null ? "No requests are available." : "You do not have any ongoing requests!"}
                </div>
                <div className="flex gap-4 pr-1">
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
    );
}
