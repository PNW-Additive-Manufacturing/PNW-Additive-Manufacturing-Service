'use server'

import { redirect, usePathname } from "next/navigation";
import { Navbar } from '@/app/components/Navigation'
import { RegularKeywordResearch, RegularCog, RegularCart, RegularCrossCircle } from 'lineicons-react';
import SidebarNavigation from '@/app/components/DashboardNavigation';
import db from "@/app/api/Database";
import { InlinePrinterSelector } from '../../../../components/InlinePrinterSelector';
import { InlineFile } from '../../../../components/InlineFile';
import PartAcceptButton from '.././PartAcceptButton';
import PartDenyButton from '.././PartDenyButton';
import PartCompleteButton from '.././PartCompleteButton';
import PartFailedButton from '.././PartFailedButton';
import PartBeginPrintingButton from '.././PartBeginPrintingButton';
import Dropdown from '../../../../components/Dropdown';
import InlineStatus from '../../../../components/InlineStatus';
import Link from "next/link";
import { DateOptions } from "@/app/api/util/Constants";

async function RequestPartsOnlyTable({request}: {request: number}) {
    var parts = await db`select * from part where requestid = ${request}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;
    var printers = await db`select * from printer;` as {name: string, model: string}[];

    return <table className='w-full overflow-y-scroll overflow-x-scroll' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Part Name</td>
                <td>Quantity</td>
                <td>Filament</td>
                <td>Status</td>
                <td>Printer</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {
                const model = models.find(m => m.id === part.modelid)!;
                const filament = filaments.find(f => f.id === part.assignedfilamentid);
                
                return <tr>
                    <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                    <td>{part.quantity} / {part.quantity}</td>
                    <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                    <td>
                        {part.status == 'printing'
                            ? <InlineStatus status='Printing' color='bg-blue-200'></InlineStatus>
                            : part.status == 'printed'
                            ? <InlineStatus status='Printed' color='bg-green-200'></InlineStatus>
                            : part.status == 'failed'
                            ? <InlineStatus status='Failed' color='bg-red-200'></InlineStatus>
                            : part.status == 'queued'
                            ? <InlineStatus status='Queued' color='bg-amber-200'></InlineStatus>
                            : part.status == 'pending'
                            ? <InlineStatus status='Pending Approval' color='bg-gray-200'></InlineStatus>
                            : <InlineStatus status={part.status} color='bg-gray-200'></InlineStatus>}
                    </td>
                    <td><InlinePrinterSelector
                        partId={part.id}    
                        printers={printers} 
                        selection={part.assignedprintername}></InlinePrinterSelector></td>
                    <td>
                        {part.status == 'printing'
                        ? <div className='flex gap-2'>
                            <PartCompleteButton part={part.id}></PartCompleteButton>
                            <PartFailedButton part={part.id}></PartFailedButton>
                        </div>
                        : part.status == 'pending'
                        ? <div className='flex gap-2'>
                            <PartAcceptButton part={part.id}></PartAcceptButton>
                            <PartDenyButton part={part.id}></PartDenyButton>
                        </div>
                        : part.status == 'queued' 
                        ? <div>
                            <PartBeginPrintingButton part={part.id}></PartBeginPrintingButton>
                        </div>
                        : <></>}
                    </td>
                </tr>
            })}
        </tbody>
    </table>
}

export default async function OrderMaintainer({params}: {params: any}) {
    if (params.order == null || Number.isNaN(Number(params.order)))
    {
        return redirect("/dashboard/maintainer");
    }
    const orderId = Number(params.order);

    const requests = await db`select * from request order by submittime asc`;
    const quiredOrder = requests.find(r => r.id == orderId);

    if (quiredOrder == null) return redirect("/dashboard/maintainer");
    const parts = await db`select * from part where requestid=${orderId} order by id asc;`;

    return (
        <main>
            <Navbar links={[
                { name: "Request a Print", path: "/request-part" },
                { name: "User Dashboard", path: "/dashboard/user" },
                { name: "Logout", path: "/user/logout" }
            ]} />

            <div className='flex flex-col lg:flex-row'>
                <SidebarNavigation items={[
                {
                    name: "Orders",
                    route: "orders",
                    icon: (className) => <RegularCart className={`${className}`}></RegularCart>,
                    active: true
                },
                {
                    name: "Printers",
                    route: "printers",
                    icon: (className) => <RegularCog className={`${className}`}></RegularCog>,
                    active: false
                },
                {
                    name: "Filaments",
                    route: "filaments",
                    icon: (className) => <RegularCrossCircle className={`${className}`}></RegularCrossCircle>,
                    active: false
                }
                ]}></SidebarNavigation>

                <div className='w-full h-screen p-12 overflow-y-scroll'>
                    <div className='w-full xl:w-3/4 lg:m-auto'>                        
                        <Dropdown name='Orders'>
                            <table className='w-full overflow-x'>
                                <thead>
                                    <tr>
                                        <td>User</td>
                                        <td>Parts</td>
                                        <td>Status</td>
                                        <td>Notes</td>
                                        <td>Submitted At</td>
                                        <td>Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => {
                                        const reqParts = parts.filter(p => p.requestid == req.id);
                                        
                                        return <tr className={req.id == quiredOrder.id ? 'outline outline-blue-200' : ''}>
                                            <td>{req.owneremail.substring(0, req.owneremail.lastIndexOf('@'))}</td>
                                            <td>{req.name || `${reqParts.length} Part(s)`}</td>
                                            <td>{req.isfulfilled 
                                                    ? <InlineStatus status="Fulfilled" color='bg-green-200'></InlineStatus>
                                                    : <InlineStatus status='In Progress' color='bg-blue-200'></InlineStatus>
                                            }</td>
                                            <td className="truncate">{req.notes || <span className="text-gray-500">None supplied</span>}</td>
                                            <td>{req.submittime.toLocaleString("en-US", DateOptions)}</td>
                                            <td>
                                                <Link href={req.id == orderId ? '/dashboard/maintainer/orders' : `/dashboard/maintainer/orders/${req.id}`}>View</Link>
                                            </td>
                                        </tr>

                                    })}
                                </tbody>
                            </table>
                        </Dropdown>

                        <Dropdown name={`Parts for ${quiredOrder.name}`} className='mt-8'>
                            <RequestPartsOnlyTable request={quiredOrder.id}></RequestPartsOnlyTable>
                        </Dropdown>

                    </div>
                </div>
            </div>
        </main>
    );
}

