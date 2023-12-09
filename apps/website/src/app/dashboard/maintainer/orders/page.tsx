import Image from 'next/image'
import HorizontalWrap from '@/app/components/HorizontalWrap';
import { Navbar } from '@/app/components/Navigation'
import { CSSProperties, createContext, useContext, useDebugValue, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import ModelViewer from '@/app/components/ModelViewer';
import { BoxGeometry, BufferGeometry, Camera, Euler, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RegularKeywordResearch, RegularCog, RegularCart, RegularWarning, RegularCrossCircle, RegularCheckmark, RegularUser } from 'lineicons-react';
import UserSpan from '@/app/components/UserSpan';
import PrinterSpan from '@/app/components/PrinterSpan';
import SidebarNavigation from '@/app/components/DashboardNavigation';
import db from "@/app/api/Database";
import { InlinePrinterSelector } from '../../../components/InlinePrinterSelector';
import { ProgressBar } from '../../../components/ProgressBar';
import { InlineFile } from '../../../components/InlineFile';
import PartAcceptButton from './PartAcceptButton';
import PartDenyButton from './PartDenyButton';
import PartCompleteButton from './PartCompleteButton';
import PartFailedButton from './PartFailedButton';
import PartBeginPrintingButton from './PartBeginPrintingButton';
import Dropdown from '../../../components/Dropdown';
import InlineStatus from '../../../components/InlineStatus';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DateOptions } from '@/app/api/util/Constants';

interface PrintersContext {
    Printers: string[]
}

async function RunningPartsTable() {
    var parts = await db`select p.*, owneremail from part as p, request as r where (p.status='printing' or p.status='printed' or p.status='failed') and p.requestid = r.id`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;
    var printers = await db`select * from printer;` as {name: string, model: string}[];

    return <table className='w-full overflow-y-scroll overflow-x-scroll' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Part Name</td>
                <td>User</td>
                <td>Status</td>
                <td>Quantity</td>
                <td>Filament</td>
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
                    <td>{part.lastname} {part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                    <td>{part.status == 'printing'
                            ? <InlineStatus status='Printing' color='bg-blue-200'></InlineStatus>
                            : part.status == 'printed'
                            ? <InlineStatus status='Printed' color='bg-green-200'></InlineStatus>
                            : part.status == 'failed'
                            ? <InlineStatus status='Failed' color='bg-red-200'></InlineStatus>
                            : <></>}
                    </td>
                    <td>{part.quantity}</td>
                    <td>{filament?.material.toUpperCase()} {filament?.color}</td>
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

async function QueuedPartsTable() {
    var parts = await db`select p.*, r.owneremail from part as p, request as r where p.status='queued' and p.requestid=r.id`;
    var parts = await db`select p.*, r.owneremail from part as p, request as r where p.status='queued' and p.requestid=r.id`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var printers = await db`select * from printer;` as {name: string, model: string}[];

    return <table className='w-full overflow-y-auto' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Part Name</td>
                <td>User</td>
                <td>Quantity</td>
                <td>Filament</td>
                <td>Printer</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {parts.map((part, index) => {
                let model = models.find((m) => m.id === part.modelid)!;
                let filament = filaments.find(f => f.id === part.assignedfilamentid);
                return (
                    <tr key={part.id}>
                        <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                        <td>{part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                        <td>{part.quantity}</td>
                        <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                        <td><InlinePrinterSelector
                            partId={part.id}    
                            printers={printers} 
                            selection={part.assignedprintername}></InlinePrinterSelector></td>
                        <td>
                            <PartBeginPrintingButton part={part.id}></PartBeginPrintingButton>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
}

async function PendingReviewPartsTable()
{
    var parts = await db`select p.*, owneremail from part as p, request as r where p.status='pending' and p.requestid = r.id`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;

    return <table className='w-full overflow-y-auto' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Part Name</td>
                <td>User</td>
                <td>Quantity</td>
                <td>Filament</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {
                let model = models.find((m) => m.id === part.modelid)!;
                let filament = filaments.find(f => f.id === part.assignedfilamentid);
                return (<tr key={part.id}>
                    <td><InlineFile filename={model.name} filepath={model.filepath}></InlineFile></td>
                    <td>{part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                    <td>{part.quantity}</td>
                    <td>{filament?.material.toUpperCase()} {filament?.color}</td>
                    <td className='flex gap-2'> 
                        <PartAcceptButton part={part.id}></PartAcceptButton>
                        <PartDenyButton part={part.id}></PartDenyButton>
                    </td>
                </tr>
                );
            })}
        </tbody>
    </table>
}

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

export default async function Maintainer({params}: {params: any}) {
    const requests = await db`select * from request order by submittime asc`;
    const parts = await db`select * from part order by id asc;`;

    console.log(params);

    return (
        <main>
            <Navbar links={[
                { name: "Request a Print", path: "/request-part" },
                { name: "User Dashboard", path: "/dashboard/user" },
                { name: "Logout", path: "/user/logout" }
            ]} />

            <div className='flex flex-col lg:flex-row'>
                <SidebarNavigation style={{height: 'calc(100vh - 72px)'}} items={[
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

                <div className='w-full p-12 overflow-y-scroll' style={{maxHeight: 'calc(100vh - 72px)'}}>

                    {/* <div className='flex flex-row gap-4'>
                        <div className='rounded-xl py-4 px-6 w-fit h-fit bg-amber-300 bg-opacity-20'>
                            <span className=''>Running Orders: </span>
                            <span className='font-semibold'>5</span>
                        </div>
                        <div className='rounded-lg py-4 px-6 w-fit h-fit bg-sky-600 bg-opacity-20'>
                            <span className=''>Queued Orders: </span>
                            <span className='font-semibold'>10</span>
                        </div>
                        <div className='rounded-lg py-4 px-6 w-fit h-fit bg-slate-500 bg-opacity-20'>
                            <span className=''>Waiting for Review: </span>
                            <span className='font-semibold'>10</span>
                        </div>
                    </div> */}

                    <div className='w-full xl:w-3/4 lg:mx-auto'>
                        <Dropdown name='Requests'>
                            <table className='w-full overflow-x'>
                                <thead>
                                    <tr>
                                        <td>Request Name</td>
                                        <td>User</td>
                                        <td>Status</td>
                                        <td>Notes</td>
                                        <td>Submitted At</td>
                                        <td>Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => {
                                        const reqParts = parts.filter(p => p.requestid == req.id);
                                        
                                        return <tr>
                                            <td>{req.name || `${reqParts.length} Part(s)`}</td>
                                            <td>{req.owneremail.substring(0, req.owneremail.lastIndexOf('@'))}</td>
                                            <td>{req.isfulfilled 
                                                    ? <InlineStatus status="Fulfilled" color='bg-green-200'></InlineStatus>
                                                    : <InlineStatus status='In Progress' color='bg-blue-200'></InlineStatus>
                                            }</td>
                                            <td>{req.notes || <span className="text-gray-500">None supplied</span>}</td>
                                            <td>{req.submittime.toLocaleString("en-US", DateOptions)}</td>
                                            <td>
                                                <Link href={`/dashboard/maintainer/orders/${req.id}`}>View</Link>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                        </Dropdown>

                        <Dropdown name='Active Parts' className='mt-8'>
                            <RunningPartsTable></RunningPartsTable>
                        </Dropdown>

                        <Dropdown name='Queued Parts' className='mt-8'>
                            <QueuedPartsTable></QueuedPartsTable>
                        </Dropdown>

                        <Dropdown name='Pending Parts' className='mt-8'>
                            <PendingReviewPartsTable></PendingReviewPartsTable>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </main>
    );
}

