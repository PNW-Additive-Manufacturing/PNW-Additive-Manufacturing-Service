"use client"

import { InlinePrinterSelector } from '../../../components/InlinePrinterSelector';
import { InlineFile } from '../../../components/InlineFile';
import { PartAcceptButton,PartDenyButton,PartBeginPrintingButton,PartCompleteButton,PartFailedButton,RequestFulfilledButton,RequestReopenButton } from './Buttons';
import InlineStatus from '../../../components/InlineStatus';
import { DateOptions } from '@/app/api/util/Constants';
import Table from '@/app/components/Table';
import { useEffect, useState, useTransition } from "react";
import { GetRequestData } from "./TablesServer";

export function RunningPartsTable({parts, filaments, models, printers} : {parts:any, filaments:any, models:any, printers:any}) {
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
            {parts.map((part:any) => {
                const model = models.find((m:any) => m.id === part.modelid)!;
                const filament = filaments.find((f:any) => f.id === part.assignedfilamentid);

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

export function QueuedPartsTable({parts, filaments, models, printers} : {parts:any, filaments:any, models:any, printers:any}) {
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
            {parts.map((part:any, index:any) => {
                let model = models.find((m:any) => m.id === part.modelid)!;
                let filament = filaments.find((f:any) => f.id === part.assignedfilamentid);
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

export function PendingReviewPartsTable({parts, filaments, models} : {parts:any, filaments:any, models:any}) {
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
            {parts.map((part:any) => {
                let model = models.find((m:any) => m.id === part.modelid)!;
                let filament = filaments.find((f:any) => f.id === part.assignedfilamentid);
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

export function RequestsTable({ parts, activeRequests, isFulfilled } : {parts : any, activeRequests : any, isFulfilled : boolean }) {
    var [quiredOrder, setQuiredOrder] = useState(undefined) as [quiredOrder : number|undefined, setQuiredOrder : any];
    
    return <Table>
        <thead>
            <tr>
                <th>Request Name</th>
                <th>User</th>
                <th>Notes</th>
                <th>Submitted</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {activeRequests.map((req:any) => {
                const reqParts = parts.filter((p:any) => p.requestid == req.id);

                return <>
                    <tr className={quiredOrder && req.id == quiredOrder ? 'outline outline-blue-200' : ''}>
                        <td>{req.name || `${reqParts.length} Part(s)`}</td>
                        <td>{req.owneremail.substring(0, req.owneremail.lastIndexOf('@'))}</td>
                        <td className='max-w-md truncate'>{req.notes || <span className="text-gray-500">None supplied</span>}</td>
                        <td>{req.submittime.toLocaleString("en-US", DateOptions)}</td>
                        <td className='flex gap-2'>
                            {(() => {
                                if (!quiredOrder || req.id != quiredOrder) {
                                    return (
                                        <div className={`text-base px-2 py-1 w-fit text-white rounded-md bg-gray-400 hover:cursor-pointer hover:bg-gray-500`}
                                            onClick = {(e) => setQuiredOrder(req.id)}>
                                            View
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className={`text-base px-2 py-1 w-fit text-white rounded-md bg-gray-400 hover:cursor-pointer hover:bg-gray-500`}
                                            onClick = {(e) => setQuiredOrder(undefined)}>
                                            Back
                                        </div>
                                    );
                                }
                            })()}
                            
                            {(() => {
                                if (isFulfilled) {
                                    return (<RequestReopenButton request={req.id}></RequestReopenButton>);
                                } else {
                                    return (<RequestFulfilledButton request={req.id}></RequestFulfilledButton>);
                                }
                            })()}
                        </td>
                    </tr>
                    {(() => {
                        if (quiredOrder && req.id == quiredOrder) {
                            return (<tr>
                                <td colSpan={5} className={"bg-white"}>
                                    <RequestPartsOnlyTable request={quiredOrder}></RequestPartsOnlyTable>
                                </td>
                            </tr>);
                        }
                    })()}
                </>
            })}
        </tbody>
    </Table>
}

export function RequestPartsOnlyTable({ request }: { request: number }) {
    const [pending, startTransition] = useTransition();

    var [parts, setParts] =         useState([]) as [parts:any, setParts:any];
    var [filaments, setFilaments] = useState([]) as [filaments:any, setFilaments:any];
    var [models, setModels] =       useState([]) as [models:any, setModels:any];
    var [printers, setPrinters] =   useState([]) as [printers:any, setPrinters:any];

    useEffect(() => {
        const updateData = async () => {
            const requestData = await GetRequestData(request);

            setParts(requestData.parts);
            setFilaments(requestData.filaments);
            setModels(requestData.models);
            setPrinters(requestData.printers);
        }
        updateData();
    }, [])

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
            {parts.map((part:any) => {
                const model = models.find((m:any) => m.id === part.modelid)!;
                const filament = filaments.find((f:any) => f.id === part.assignedfilamentid);

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