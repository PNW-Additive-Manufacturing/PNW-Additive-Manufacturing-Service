"use client"

import Image from 'next/image'
import HorizontalWrap from '@/app/components/HorizontalWrap';
import { Navbar } from '@/app/components/Navigation'
import { CSSProperties, useDebugValue, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import ModelViewer from '@/app/components/ModelViewer';
import { BoxGeometry, BufferGeometry, Camera, Euler, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RegularLayers, RegularSearchAlt, RegularSpinnerSolid, RegularChevronDown, RegularCog, RegularEye, RegularCheckmarkCircle, RegularBan, RegularCart, RegularCrossCircle } from 'lineicons-react';
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


export default function Maintainer() 
{
    return (
        <main className='flex'>
            <SidebarNavigation items={[
            {
                name: "Orders",
                route: "orders",
                icon: (className) => <RegularCart className={`${className}`}></RegularCart>,
                active: false
            },
            {
                name: "Printers",
                route: "printers",
                icon: (className) => <RegularCog className={`${className}`}></RegularCog>,
                active: true
            },
            {
                name: "Filaments",
                route: "filaments",
                icon: (className) => <RegularCrossCircle className={`${className}`}></RegularCrossCircle>,
                active: false
            }
            ]}></SidebarNavigation>

            <div className='bg-purple-400 w-3/6 h-screen'></div>
            
            <div className='bg-amber-100 w-96 h-screen'></div>
        </main>
    );
}

