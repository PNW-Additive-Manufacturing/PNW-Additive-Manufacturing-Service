import db from "@/app/api/Database";
import { InlinePrinterSelector } from '../../../components/InlinePrinterSelector';
import { InlineFile } from '../../../components/InlineFile';
import { PartAcceptButton,PartDenyButton,PartBeginPrintingButton,PartCompleteButton,PartFailedButton,RequestFulfilledButton,RequestReopenButton } from './Buttons';
import InlineStatus from '../../../components/InlineStatus';
import Link from 'next/link';
import { DateOptions } from '@/app/api/util/Constants';
import Table from '@/app/components/Table';

export async function RunningPartsTable() {
    var parts = await db`select p.*, owneremail from part as p, request as r where (p.status='printing' or p.status='printed' or p.status='failed') and p.requestid = r.id`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return <Table style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Filament</th>
                <th>Status</th>
                <th>User</th>
                <th>Printer</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {
                const model = models.find(m => m.id === part.modelid)!;
                const filament = filaments.find(f => f.id === part.assignedfilamentid);

                return <tr>
                    <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                    <td>{part.quantity}</td>
                    <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                    <td>{part.status == 'printing'
                        ? <InlineStatus status='Printing' color='bg-blue-200'></InlineStatus>
                        : part.status == 'printed'
                            ? <InlineStatus status='Printed' color='bg-green-200'></InlineStatus>
                            : part.status == 'failed'
                                ? <InlineStatus status='Failed' color='bg-red-200'></InlineStatus>
                                : <></>}</td>
                    <td>
                        {part.lastname} {part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}
                    </td>
                    <td><InlinePrinterSelector
                        partId={part.id}
                        printers={printers}
                        selection={part.assignedprintername}></InlinePrinterSelector></td>
                    <td className='flex gap-2'>
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
    </Table>
}

export async function QueuedPartsTable() {
    var parts = await db`select p.*, r.owneremail from part as p, request as r where p.status='queued' and p.requestid=r.id`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return <Table style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Filament</th>
                <th>User</th>
                <th>Printer</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {parts.map((part, index) => {
                let model = models.find((m) => m.id === part.modelid)!;
                let filament = filaments.find(f => f.id === part.assignedfilamentid);
                return (
                    <tr key={part.id}>
                        <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                        <td>{part.quantity}</td>
                        <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                        <td>{part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                        <td><InlinePrinterSelector
                            partId={part.id}
                            printers={printers}
                            selection={part.assignedprintername} /></td>
                        <td>
                            <PartBeginPrintingButton part={part.id} />
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </Table>
}

export async function PendingReviewPartsTable() {
    var parts = await db`select p.*, owneremail from part as p, request as r where p.status='pending' and p.requestid = r.id`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;

    return <Table style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Filament</th>
                <th>User</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {
                let model = models.find((m) => m.id === part.modelid)!;
                let filament = filaments.find(f => f.id === part.assignedfilamentid);
                return (<tr key={part.id}>
                    <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                    <td>{part.quantity}</td>
                    <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                    <td>{part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                    <td className='flex gap-2'>
                        <PartAcceptButton part={part.id}></PartAcceptButton>
                        <PartDenyButton part={part.id}></PartDenyButton>
                    </td>
                </tr>
                );
            })}
        </tbody>
    </Table>
}

export async function ActiveRequestsTable({ quiredOrder } : { quiredOrder? : any }) {
    const activeRequests = await db`select * from request where isfulfilled='false' order by submittime asc`;
    const parts = await db`select * from part order by id asc;`;

    return <Table>
        <thead>
            <tr>
                <th>Parts</th>
                <th>User</th>
                <th>Notes</th>
                <th>Submitted</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {activeRequests.map(req => {
                const reqParts = parts.filter(p => p.requestid == req.id);

                return <tr className={quiredOrder && req.id == quiredOrder.id ? 'outline outline-blue-200' : ''}>
                    <td>{req.name || `${reqParts.length} Part(s)`}</td>
                    <td>{req.owneremail.substring(0, req.owneremail.lastIndexOf('@'))}</td>
                    <td className='max-w-md truncate'>{req.notes || <span className="text-gray-500">None supplied</span>}</td>
                    <td>{req.submittime.toLocaleString("en-US", DateOptions)}</td>
                    <td className='flex gap-2'>
                        <Link
                            className={`text-base px-2 py-1 w-fit text-white rounded-md bg-gray-400 hover:cursor-pointer hover:bg-gray-500`}
                            href={`/dashboard/maintainer/orders/${req.id}`}>View
                        </Link>
                        <RequestFulfilledButton request={req.id}></RequestFulfilledButton>
                    </td>
                </tr>
            })}
        </tbody>
    </Table>
}

export async function CompletedRequestsTable({ quiredOrder } : { quiredOrder? : any }) {
    const completedRequests = await db`select * from request where isfulfilled='true' order by submittime asc`;
    const parts = await db`select * from part order by id asc;`;

    return <Table>
        <thead>
            <tr>
                <th>Parts</th>
                <th>User</th>
                <th>Notes</th>
                <th>Submitted</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {completedRequests.map(req => {
                const reqParts = parts.filter(p => p.requestid == req.id);

                return <tr className={quiredOrder && req.id == quiredOrder.id ? 'outline outline-blue-200' : ''}>
                    <td>{req.name || `${reqParts.length} Part(s)`}</td>
                    <td>{req.owneremail.substring(0, req.owneremail.lastIndexOf('@'))}</td>
                    <td className='max-w-md truncate'>{req.notes || <span className="text-gray-500">None supplied</span>}</td>
                    <td>{req.submittime.toLocaleString("en-US", DateOptions)}</td>
                    <td className='flex gap-2'>
                        <Link
                            className={`text-base px-2 py-1 w-fit text-white rounded-md bg-gray-400 hover:cursor-pointer hover:bg-gray-500`}
                            href={`/dashboard/maintainer/orders/${req.id}`}>View
                        </Link>
                        <RequestReopenButton request={req.id}></RequestReopenButton>
                    </td>
                </tr>
            })}
        </tbody>
    </Table>
}

export async function RequestPartsOnlyTable({ request }: { request: number }) {
    var parts = await db`select * from part where requestid = ${request}`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${db(parts.map((p) => p.modelid))}`;
    var printers = await db`select * from printer;` as { name: string, model: string }[];

    return <Table style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Filament</th>
                <th>Status</th>
                <th>Printer</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {
                const model = models.find(m => m.id === part.modelid)!;
                const filament = filaments.find(f => f.id === part.assignedfilamentid);

                return <tr>
                    <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                    <td>{part.quantity}</td>
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
    </Table>
}