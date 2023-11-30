"use client"

import Image from 'next/image'
import HorizontalWrap from '../components/HorizontalWrap';
import { Navbar } from '../components/Navigation'
import { CSSProperties, useDebugValue, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import ModelViewer from '../components/ModelViewer';
import { BoxGeometry, BufferGeometry, Camera, Euler, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RegularLayers, RegularSearchAlt, RegularSpinnerSolid, RegularChevronDown, RegularCog, RegularEye, RegularCheckmarkCircle, RegularBan } from 'lineicons-react';
import UserSpan from '../components/UserSpan';
import PrinterSpan from '../components/PrinterSpan';

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

var orders: Order[] = [
    {
        Username: "Aaron Jung",
        Parts: [
            {
                Name: "Padlock",
                // State: PartState.Printing,
                Progress: Math.random() * 100,
                AssignedPrinter: printers[0]
            },
            {
                Name: "Toaster",
                Progress: Math.random() * 100,
                AssignedPrinter: printers[0]
            }
        ]
    },
    {
        Username: "Diskshant Sharma",
        Parts: [
            {
                Name: "Something",
                Progress: 100,
                AssignedPrinter: printers[1]
            }
        ]
    },
    {
        Username: "David",
        Parts: [
            {
                Name: "Amazing Robot",
                Progress: -2,
                AssignedPrinter: printers[1]
            }
        ]
    }
]

export default function Dashboard() 
{
    const [selectedOrder, setSelectedOrder] = useState<Order>();
    const [selectedPart, setPart] = useState<BufferGeometry>();
    const [selectedPrinter, setSelectedPrinter] = useState<DashboardPrinter>();

    function ProgressBar({progress, color, className, style}: {progress: number, color?: string, className?: string, style?: CSSProperties})
    {
        console.log(color);
        return <div className={"rounded-md h-3 "+(className||"")} style={{backgroundColor: "rgb(240, 240, 240)",...style}}>
            <div className={color || "bg-blue-400"} style={{width: `${progress}%`, height: "inherit", borderRadius: "inherit", backgroundColor: "rgb(96 165 250)"}}></div>
        </div>
    }

    return (
        <div className="flex" style={{height: "100vh"}}>
        {/* <Navbar links={[]}></Navbar> */}
        {/* <HorizontalWrap> */}
        <div className="bg-white p-4" style={{width: "6rem", height: "100vh"}}>
            <Image className="p-0.5" src="/logo.svg" alt="Icon" width={100} height={100}></Image>
            <div className="flex items-center flex-col gap-4 pt-8 pb-4 w-full h-full">
                <span className="text-base"><RegularSearchAlt className="w-full h-fit px-3 pb-2 rounded-lg border-solid"></RegularSearchAlt>Orders</span>
                <span><RegularCog className="w-full h-fit px-4 pb-2 rounded-lg border-solid"></RegularCog>Settings</span>
                {/* <div className="overflow-ellipsis space-y-2 justify-end">Aaron</div> */}
            </div>
        </div>
        
        <HorizontalWrap>
            <div className="grid px-8 gap-2 grid-rows-5 mt-5 w-full 2xl:flex-1">
                {/* Printers */}
                <div className="container col-start-1 row-start-1">
                    <p className="text-center mb-4 uppercase w-full text-gray-500">Printers</p> 
                    <div className="w-full flex flex-row gap-4" >
                        {printers.map(printer => 
                            <div 
                                className="w-fit p-3 flex items-center flex-col rounded-md" 
                                style={{
                                    backgroundColor: "rgb(251, 251, 251)", 
                                    border: "2px solid",
                                    borderColor: `${printer.Color}50`
                                    // borderColor: "rgb(96, 165, 250)"
                                    // borderColor: printer.State == PrinterState.Printing ? "rgb(55, 189, 113)" : "rgb(220, 220, 220)"
                                }}>
                                <Image className="pb-3" src="/Printer.png" alt="printer Image" width={60} height={60} style={{filter: "grayscale(0.20)"}}></Image>
                                <p className='font-medium text-sm'>{printer.Model}</p>
                                <p className='font-light text-xs'>{printer.State}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="container col-start-1 row-start-2 mt-4">
                    {selectedOrder == null ? <p>Select an Order</p> : <div className="">
                        <span className="text-lg">Order for <UserSpan name={selectedOrder.Username}></UserSpan></span>
                        <p className="float-right">Submitted at 1/1/2023</p>

                        <div className="flex flex-col gap-4 w-full" style={{paddingTop: "1rem"}}>
                            {selectedOrder.Parts.map(part => <div className="mt-2">
                                <div className="p-4" style={{backgroundColor: "rgb(251, 251, 251)"}}>
                                    <div className="flex items-center">
                                        {/* {part.Progress == -1 
                                            ? <RegularSpinnerSolid className="fill-slate-500 w-8 h-8"></RegularSpinnerSolid> 
                                            : <RegularLayers className="fill-green-400 w-8 h-8"></RegularLayers>
                                        } */}
                                        <p className="text-lg inline">{part.Name}</p>

                                        <ProgressBar 
                                            progress={part.Progress == -2 ? 100 : part.Progress == -1 ? 0 : part.Progress} 
                                            color="bg-red-400"
                                            // color={part.Progress == -2 ? "bg-red-400" : undefined}
                                            className="flex-grow ml-3 mr-3"
                                            style={{minWidth: "4rem"}}/>
                                        <div className="flex flex-row gap-2 items-center">
                                            <RegularBan className="fill-red-500 hover:cursor-pointer w-6 h-6"/>
                                            <RegularCheckmarkCircle className="fill-green-500 hover:cursor-pointer w-6 h-6"/>
                                            <RegularEye className={`fill-indicator-inactive inline hover:fill-black hover:cursor-pointer w-8 h-8`}
                                                onClick={() => setPart(useLoader(STLLoader, "/TestModel.stl"))}/>
                                        </div>
                                    </div>
                                    <p><i>Printing on the <PrinterSpan 
                                        name={part.AssignedPrinter.Model} 
                                        color={`${part.AssignedPrinter.Color}50`} 
                                        dimensions={part.AssignedPrinter.Dimensions}></PrinterSpan></i></p>
                                </div>
                            </div>)}
                        </div>

                        { selectedPart == null ? <p className="container mt-4 text-center uppercase text-gray-500" style={{backgroundColor: "rgb(251, 251, 251)"}}>Select a Part to Preview</p> :
                        <div className="container mt-4 p-8 rounded-md" style={{backgroundColor: "rgb(251, 251, 251)", width: "100%", height: "20rem"}}>
                            <Canvas style={{width: "100%"}}>
                                <ModelViewer volume={new Vector3(220, 220, 300)} models={[{
                                    name: "Padlock",
                                    position: new Vector3(-50, 0, -30),
                                    rotation: new Euler(1.5708, 0, 0),
                                    model: selectedPart
                                }]}></ModelViewer>
                            </Canvas>
                        </div>}
                    </div>}
                </div>

                {/* Orders */}
                <div className="container col-start-2 row-span-5" style={{minWidth: "20rem"}}>
                    <p className="text-center mb-4 uppercase w-full h-full text-gray-500">Active Orders</p>
                    <div className="flex flex-col gap-2 w-full h-full">
                        {orders.map(order => {
                            const printedParts = order.Parts.filter(p => p.Progress === 100);

                            var previewText = order.Parts[0].Name;
                            if (order.Parts.length > 1) previewText += ` & ${order.Parts.length - 1} More`;

                            return <div>
                                <div className="p-4 flex items-center" style={{backgroundColor: "rgb(251, 251, 251)"}}>
                                    <p className="text-lg inline">{previewText + " for "} <UserSpan name={order.Username}></UserSpan></p>
                                    <ProgressBar progress={Math.round((printedParts.length/order.Parts.length)*100)} className="flex-grow ml-3 mr-3" style={{minWidth: "4rem"}}></ProgressBar>
                                    <RegularSearchAlt 
                                        className={`float-right w-8 h-8 ${selectedOrder == order ? "fill-blue-500" : "fill-indicator-inactive"} inline hover:cursor-pointer hover:fill-black`}
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setPart(undefined);
                                        }}/>
                                </div>
                            </div>
                        })}
                    </div>

                    <p className="text-center mb-4 mt-8 uppercase w-full text-gray-500">Queued Orders</p>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center w-full" style={{backgroundColor: "rgb(251, 251, 251)"}}>
                            <p className="bg-slate-600 text-white p-4">#1</p>
                            <div className="p-4 w-full">
                                <p className="text-lg inline">{"Something" + " for "} <UserSpan name="Aaron"></UserSpan></p>
                                <RegularSearchAlt 
                                    className={`float-right w-7 h-7 fill-indicator-inactive inline hover:cursor-pointer hover:fill-black`}/>
                            </div>
                        </div>
                        <div className="flex items-center w-full" style={{backgroundColor: "rgb(251, 251, 251)"}}>
                            <p className="bg-slate-600 text-white p-4">#2</p>
                            <div className="p-4 w-full">
                                <p className="text-lg inline">{"IKEA Table" + " for "} <UserSpan name="Cole"></UserSpan></p>
                                <RegularSearchAlt 
                                    className={`float-right w-7 h-7 fill-indicator-inactive inline hover:cursor-pointer hover:fill-black`}/>
                            </div>
                        </div>
                    </div>

                    { /* <br></br>
                    <h2>Queued Requests</h2>
                    <hr></hr>
                    <table>
                        <tr>
                            <td>Queue</td>
                            <td>Name</td>
                            <td>User</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Ender 3 V2 Camera Mount</td>
                            <td>David</td>
                        </tr>
                    </table> */}
                </div>
            </div>
        </HorizontalWrap>
        {/* </HorizontalWrap> */}
        </div>
    );
}