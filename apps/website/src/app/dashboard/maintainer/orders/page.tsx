import Image from 'next/image'
import HorizontalWrap from '@/app/components/HorizontalWrap';
import { Navbar } from '@/app/components/Navigation'
import { CSSProperties, createContext, useContext, useDebugValue, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import ModelViewer from '@/app/components/ModelViewer';
import { BoxGeometry, BufferGeometry, Camera, Euler, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RegularLayers, RegularSearchAlt, RegularSpinnerSolid, RegularChevronDown, RegularChevronDownCircle, RegularArrowUp, RegularCog, RegularEye, RegularCheckmarkCircle, RegularBan, RegularPlus, RegularCart, RegularWarning, RegularCrossCircle, RegularCheckmark } from 'lineicons-react';
import UserSpan from '@/app/components/UserSpan';
import PrinterSpan from '@/app/components/PrinterSpan';
import SidebarNavigation from '@/app/components/DashboardNavigation';
import db from "@/app/api/Database";
import { InlinePrinterSelector } from './InlinePrinterSelector';
import { ProgressBar } from './ProgressBar';
import { InlineFile } from './InlineFile';

interface PrintersContext {
    Printers: string[]
}

async function RunningPartsTable() {
    var parts = await db`select p.*, owneremail from part as p, request as r where (p.status='printing' or p.status='printed' or p.status='failed') and p.requestid = r.id`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;

    var printers = await db`select * from printer;` as {name: string, model: string}[];

    return <table className='w-full overflow-y-auto' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Part Name</td>
                <td>Quantity</td>
                <td>Status</td>
                <td>User</td>
                <td>Printer</td>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => {


                const model = models.find(m => m.id === part.modelid)!;
                const filament = filaments.find(f => f.id === part.assignedfilamentid);
                // const preferredEmail = (part.owneremail as string).split("@")[0];
                
                return <tr>
                    <td><InlineFile filename={model.name}></InlineFile></td>
                    <td>{part.quantity}</td>
                    <td>{part.status === 'printing' ? 
                        // <span><ProgressBar color='rgb(130, 199, 237)' percentage={60}></ProgressBar></span>
                        <span className='px-2 py-1 rounded-lg text-base bg-blue-200'>Printing</span>
                        : part.status === 'printed' ? 
                        <span className='text-green-500'>Completed</span>
                        : <span className='text-red-500'>Failed</span>}</td>
                    {/* <td>{part.lastname} {preferredEmail ?? part.owneremail}</td> */}
                    <td>{part.lastname} {part.owneremail}</td>
                    <td><InlinePrinterSelector
                        partId={part.id}    
                        printers={printers} 
                        selection={part.assignedprintername}></InlinePrinterSelector></td>
                </tr>
            })}
        </tbody>
    </table>
}

async function QueuedPartsTable() {
    var parts = await db`select * from part where status='queued'`;
    var models = await db`select * from model where id in ${ db(parts.map((p) => p.modelid)) }`;
    var filaments = await db`select id, material, color from filament where id in ${db(parts.map((p) => p.assignedfilamentid))}`;

    return <table className='w-full overflow-y-auto' style={{ maxHeight: "60vh" }}>
        <thead>
            <tr>
                <td>Filename</td>
                <td>Printer</td>
                <td>Progress</td>
                <td>Filament</td>
                <td>User</td>
            </tr>
        </thead>
        <tbody>
            {parts.map((part, index) => <tr key={part.id}>

                <td>{models.find((m) => m.id === part.modelid)?.name}</td>
                <td>INSERT PRINTER SELECTOR</td>
                {/* <td><InlinePrinterSelector selectedPrinter={part.assignedprintername}></InlinePrinterSelector></td> */}
                <td><ProgressBar color="blue" percentage={50}></ProgressBar></td>
                <td>{filaments.find((f)=>f.id === part.assignedfilamentid)?.material} {filaments.find((f)=>f.id === part.assignedfilamentid)?.color}</td>
                <td>Someone</td>
            </tr>)}
            {/* <tr>
            <td><InlineFile filename='companion_cube.stl'></InlineFile></td>
            <td>Ender 3 V2</td>
            <td><ProgressBar color='rgb(174, 236, 169)' percentage={100}></ProgressBar></td>
            <td>Ben</td>
            <td>$5</td>
        </tr>
        <tr>
            <td><InlineFile filename='avatar.stl'></InlineFile></td>
            <td>Ender 3 V2</td>
            <td><ProgressBar color='rgb(130, 199, 237)' percentage={50}></ProgressBar></td>
            <td>Ben</td>
            <td>$20</td>
        </tr>
        <tr>
            <td><InlineFile filename='insane_mount.stl'></InlineFile></td>
            <td>Ender 3 V2</td>
            <td><ProgressBar color='rgb(207, 83, 72)' percentage={100}></ProgressBar></td>
            <td>Aaron</td>
            <td>$10</td>
        </tr> */}
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
                <td>Model</td>
                <td>User</td>
                <td>Quantity</td>
                <td>File</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {parts.map(part => <tr key={part.id}>
                <td>{models.find((m) => m.id === part.modelid)?.name}</td>
                <td>{part.owneremail.substring(0, part.owneremail.lastIndexOf('@'))}</td>
                <td>{part.quantity}</td>
                <td><a download={true} className="text-blue-500 underline" href={`/api/download/?file=${models.find((m) => m.id === part.modelid)?.filepath}`}>Download</a></td>
                <td>
                    <a>
                        <button className="inline mx-2 text-base w-fit px-2 py-1 bg-green-500 border-none rounded-md">Accept</button>
                        <button className="inline text-base w-fit px-2 py-1 bg-red-400 border-none rounded-md">Deny</button>
                        {/* <RegularCrossCircle className='inline w-6 h-6 fill-green-400'></RegularCrossCircle> */}
                        {/* <RegularCheckmark className='inline w-6 h-6 fill-red-400'></RegularCheckmark> */}
                    </a>
                </td>
            </tr>)}
        </tbody>
    </table>
}

export default function Maintainer() {
    return (
        <main>
            <Navbar links={[
                { name: "Request a Print", path: "/request-part" },
                { name: "User Dashboard", path: "/dashboard/user" },
                { name: "Logout", path: "/user/logout" }
            ]} />

            <div className='flex'>
                <SidebarNavigation className='w-28' items={[
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
                    }
                ]}></SidebarNavigation>

                <div className='w-4/6 h-screen overflow-y-auto p-12' style={{ minWidth: "900px" }}>
                    <div className='m-auto' style={{ minWidth: "900px", maxWidth: "1100px" }}>
                        <h1 className='text-2xl mb-7'>Orders</h1>
                        {/* <p className='text-lg mb-2'>Insights</p>
                        <div className='flex flex-row gap-4'>
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

                        <h2 className='mt-12'>Processing Orders</h2>
                        <RunningPartsTable></RunningPartsTable>
                        {/* <table className='w-full overflow-y-auto' style={{ maxHeight: "60vh" }}>
                            <thead>
                                <tr>
                                    <td>Part Name</td>
                                    <td>Printer</td>
                                    <td>Progress</td>
                                    <td>User</td>
                                    <td>Cost</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><InlineFile filename='companion_cube.stl'></InlineFile></td>
                                    <td>Ender 3 V2</td>
                                    <td><ProgressBar color='rgb(174, 236, 169)' percentage={100}></ProgressBar></td>
                                    <td>Ben</td>
                                    <td>$5</td>
                                </tr>
                                <tr>
                                    <td><InlineFile filename='avatar.stl'></InlineFile></td>
                                    <td>Ender 3 V2</td>
                                    <td><ProgressBar color='rgb(130, 199, 237)' percentage={50}></ProgressBar></td>
                                    <td>Ben</td>
                                    <td>$20</td>
                                </tr>
                                <tr>
                                    <td><InlineFile filename='insane_mount.stl'></InlineFile></td>
                                    <td>Ender 3 V2</td>
                                    <td><ProgressBar color='rgb(207, 83, 72)' percentage={100}></ProgressBar></td>
                                    <td>Aaron</td>
                                    <td>$10</td>
                                </tr>
                            </tbody>
                        </table> */}

                        <h2 className='mt-12'>Queued Parts</h2>
                        <QueuedPartsTable></QueuedPartsTable>

                        <h2 className='mt-12'>Pending Review Parts</h2>
                        <PendingReviewPartsTable></PendingReviewPartsTable>

                        {/* <table className='w-full overflow-y-auto' style={{maxHeight: "60vh"}}>
                        <thead>
                            <tr>
                                <td className='w-5'>Position</td>
                                <td>Filename</td>
                                <td>Printer</td>
                                <td>User</td>
                                <td>Filament</td>
                                <td>Date</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><InlinePrinterSelector selectedPrinter='Ender 3 V2'></InlinePrinterSelector></td>
                                <td>Ryan</td>
                                <td>$20</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>2 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='gear.stl'></InlineFile></td>
                                <td><InlinePrinterSelector selectedPrinter='Ender 5 S1'></InlinePrinterSelector></td>
                                <td>David</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>3 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='drone_arm.stl'></InlineFile></td>
                                <td><InlinePrinterSelector fill='fill-red-400' hoveredColor='fill-red-300'></InlinePrinterSelector>
                                </td>
                                <td>David</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>4 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='gear.stl'></InlineFile></td>
                                <td><InlinePrinterSelector selectedPrinter='Ender 5 S1'></InlinePrinterSelector></td>
                                <td>David</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>4 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='something.stl'></InlineFile></td>
                                <td><InlinePrinterSelector selectedPrinter='Ender 5 S1'></InlinePrinterSelector></td>
                                <td>Someone</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>4 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='something.stl'></InlineFile></td>
                                <td><InlinePrinterSelector selectedPrinter='Ender 5 S1'></InlinePrinterSelector></td>
                                <td>Someone</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                            <tr>
                                <td className='flex items-center'>
                                    <span className='m-auto pr-8'>4 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                </td>
                                <td><InlineFile filename='something.stl'></InlineFile></td>
                                <td><InlinePrinterSelector></InlinePrinterSelector></td>
                                <td>Someone</td>
                                <td>$30</td>
                                <td>{new Date().toLocaleDateString("en-US")}</td>
                            </tr>
                        </tbody>
                    </table> */}
                    </div>
                </div>
            </div>
        </main>
    );
}

