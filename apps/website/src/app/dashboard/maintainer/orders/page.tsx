"use client"

import Image from 'next/image'
import HorizontalWrap from '@/app/components/HorizontalWrap';
import { Navbar } from '@/app/components/Navigation'
import { CSSProperties, createContext, useContext, useDebugValue, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import ModelViewer from '@/app/components/ModelViewer';
import { BoxGeometry, BufferGeometry, Camera, Euler, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RegularLayers, RegularSearchAlt, RegularSpinnerSolid, RegularChevronDown, RegularChevronDownCircle, RegularArrowUp, RegularDownload, RegularCog, RegularEye, RegularCheckmarkCircle, RegularBan, RegularCart, RegularWarning } from 'lineicons-react';
import UserSpan from '@/app/components/UserSpan';
import PrinterSpan from '@/app/components/PrinterSpan';
import SidebarNavigation from '@/app/components/DashboardNavigation';

enum PrinterState 
{
    Standby = "Standby",
    Printing = "Printing",
    Paused = "Paused"
}
interface DashboardPrinter 
{   
    Model: string,
    State: PrinterState,
    Color: string,
    Dimensions: [number, number, number]
}
enum PartState {
    Queued = "Queued",
    Printing = "Printing",
    Failed = "Failed",
    Printed = "Printed"
}
interface Order
{
    Username: string,
    Parts: {
        Name: string,
        // State: PartState,
        Progress: number
        AssignedPrinter: DashboardPrinter,
    }[]
}

var printers: DashboardPrinter[] = [
    {
        Model: "Ender 3 V2",
        State: PrinterState.Printing,
        Color: "#3252a8",
        Dimensions: [220, 220, 300]
    },
    {
        Model: "Ender 5 S1",
        State: PrinterState.Standby,
        Color: "#e09034",
        Dimensions: [220, 220, 350]
    },
    {
        Model: "Bambu X1",
        State: PrinterState.Standby,
        Color: "#e00e12",
        Dimensions: [220, 220, 350]
    },
    {
        Model: "Bambu X1E",
        State: PrinterState.Standby,
        Color: "#208034",
        Dimensions: [220, 220, 350]
    },
    {
        Model: "Creality K1",
        State: PrinterState.Standby,
        Color: "#p92819",
        Dimensions: [220, 220, 350]
    },
]

function InlineFile({filename, className}: {filename: string, className?: string})
{
    var [isHovered, setIsHovered] = useState<boolean>();

    // TODO: Include download link when clicked on.
    return <span
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)} 
            className={`${className}`}>
        {filename}
        <RegularDownload className={`inline p ml-2 h-max aspect-square transition-colors ${isHovered ? 'fill-blue-400' : 'fill-transparent'} hover:cursor-pointer`}></RegularDownload>
    </span>
}

interface PrintersContext
{
    Printers: string[]
}

function InlinePrinterSelector({selectedPrinter, fill, hoveredColor, className}: 
    {selectedPrinter?: string, fill?: string, hoveredColor?: string, className?: string})
{
    fill = fill ?? 'fill-slate-200';
    hoveredColor = hoveredColor ?? 'fill-slate-400';
    selectedPrinter = selectedPrinter ?? "unassigned";

    var [selection, setSelection] = useState<string>(selectedPrinter);
    
    // const printersContext = useContext<PrintersContext>()
    var options: string[] = ["Ender 3 V2", "Ender 5 S1", "Bambu X1C", "Bambu X1E"];

    return <select 
        defaultValue={selectedPrinter}
        className={`bg-transparent ${selection == 'unassigned' ? 'text-red-400' : ''} ${className}`}
        onInput={event => {setSelection(event.currentTarget.value); event.preventDefault(); console.log(event.currentTarget)}}
    >
        <option disabled selected value="unassigned">Unassigned</option>
        {options.map(option => <option value={option}>{option}</option>)}
    </select>
}

function ProgressBar({color, percentage, backgroundColor, className}: 
    {color: string, percentage: number, backgroundColor?: string, className?: string})
{
    return <div className={'rounded-md h-3 w-24 bg-white ' + className} style={{backgroundColor: backgroundColor ?? "white"}}>
        <div className='h-full overflow-x-hidden' style={{backgroundColor: color, width: `${percentage}%`, borderRadius: "inherit"}}></div>
    </div>
}


export default function Maintainer() {
    return (
        <main >
            <Navbar links={[
                {name: "Request a Print", path: "/request-part"},
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Logout", path: "/user/logout"}
            ]}/>

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

                {/* <div className='bg-purple-400 w-3/6 h-screen'> */}
                <div className='w-4/6 h-screen overflow-y-auto p-12' style={{minWidth: "900px"}}>
                    <div className='m-auto' style={{minWidth: "900px", maxWidth: "1100px"}}>
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

                        <h2 className='mt-12'>Running Orders</h2>
                        <table className='w-full overflow-y-auto' style={{maxHeight: "60vh"}}>
                            <thead>
                                <tr>
                                    <td>Filename</td>
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
                        </table>

                        <h2 className='mt-12'>Queued Orders</h2>
                        <table className='w-full overflow-y-auto' style={{maxHeight: "60vh"}}>
                            <thead>
                                <tr>
                                    <td className='w-5'>Position</td>
                                    <td>Filename</td>
                                    <td>Printer</td>
                                    <td>User</td>
                                    <td>Cost</td>
                                    <td>Date</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='flex items-center'>
                                        <span className='m-auto pr-8'>1 <RegularArrowUp className='ml-2 inline w-5 h-5 fill-slate-500'></RegularArrowUp></span>
                                    </td>
                                    <td><InlineFile filename='lock.stl'></InlineFile></td>
                                    {/* <td>Ender 3 V2</td> */}
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
                        </table>
                    </div>
                </div>                                                                                                                                                                          
                
                <div className='bg-amber-100 w-96 h-screen'></div>
            </div >
        </main>
    );
}

