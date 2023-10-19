"use client"

import { BufferGeometryNode, Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Caveat } from "next/font/google";
import { ChangeEventHandler, HTMLInputTypeAttribute, use, useEffect, useState } from "react"
// import ModelViwer from "../components/ModelViwer"

import React from 'react';
import ReactDOM from 'react-dom';
import { StlViewer, ModelDimensions, ModelProps } from "react-stl-viewer";
import { Mesh, BufferGeometry, BufferGeometryLoader, MeshPhysicalMaterial, NormalBufferAttributes } from 'three';
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import PrintPlanner from "../components/PrintPlanner";

const url = "https://storage.googleapis.com/ucloud-v3/ccab50f18fb14c91ccca300a.stl"

const style = {
    color: "blue",
    top: 0,
    left: 0,
    width: '50vw',
    height: '50vh',
}

function Input({ label, type, id, placeholder }: { label: string, type: HTMLInputTypeAttribute, id: string, placeholder: string }): JSX.Element {
    return (
        <div className="">
            <p className="uppercase font-semibold br-2">{label}</p>
            <input className="" id={id} type={type} placeholder={placeholder}></input>
        </div>
    )
}

function ModelInput({ label, id }: { label: string, id: string }): JSX.Element {
    const [geometry, setGeometry] = useState<BufferGeometry<NormalBufferAttributes>>();

    async function loadGeometry(input: HTMLInputElement): Promise<void> {
        const data = await input.files![0].arrayBuffer();
        const loader = new STLLoader();
        const geometry = loader.parse(data);
        setGeometry(geometry);
        console.log("Loaded new model", geometry);
    }

    return (
        <div>
            <p>{label}</p>
            <input
                type="file"
                id={id}
                accept=".stl"
                onChange={async (elem) => loadGeometry(elem.target)}>
            </input>
            {/* {geometry ? <div className="bg-green-300"><StlViewer onError={(err) => console.error("Failed to load mode", err)} url={""} orbitControls={true} modelProps={{
                color: "red",
                geometryProcessor: () => geometry,
                positionX: 0,
                positionY: 0,
                rotationX: 90,
                rotationZ: 20
            }}></StlViewer></div> : <p>Upload a Model!</p>} */}
            { geometry ? <Canvas>
                <ambientLight/>
                <ModelViwer geometry={geometry}></ModelViwer>
                <mesh>
                    
                </mesh>
                </Canvas> : <p>Upload a model!</p> }
        </div>
    )
}

// class ModelInput extends React.Component<{label: string, id: string}, {geometry: BufferGeometry | undefined}> {
//     constructor(props) {
//         super(props);
//         this.state = {geometry: undefined};
//     }

//     private async updateGeometry(elem: React.ChangeEvent<HTMLInputElement>): Promise<void> {
//         const data = await elem.target.files![0].arrayBuffer();

//         const loader = new STLLoader();
//         const geometry = loader.parse(data);
//         this.setState({geometry: geometry})
//     }

//     render(): React.ReactNode {
//         return (
//             <div>
//                 <p>{this.props.label}</p>
//                 <input 
//                     type="file" 
//                     id={this.props.id} 
//                     accept=".stl" 
//                     onChange={async (elem) => await this.updateGeometry(elem)}>
//                 </input>
//                 { this.state.geometry ? <StlViewer url={""} orbitControls={true} modelProps={{
//                     color: "red",
//                     geometryProcessor: () => this.state.geometry!,
//                     positionX: 0,
//                     positionY: 0,
//                     rotationX: 90,
//                     rotationZ: 20
//                 }}></StlViewer> : <p>Upload a Model!</p> }
//             </div>
//         )
//     }
// }

export default function Request() {
    function onFinishLoading(dimensions: ModelDimensions) {
        console.log(`Loaded model: ${Math.ceil(dimensions.width)}x${Math.ceil(dimensions.length)}x${Math.ceil(dimensions.height)}`)
    }

    function onError(err: Error) {
        console.error(`Failed to load STL: ${err}`);
    }

    return (
        <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
            <h1 className="w-full text-center">Request a Print</h1>
            <form>
                <Input label="First Name" type="text" id="name" placeholder="Enter your first name"></Input>
                <Input label="Last Name" type="text" id="name" placeholder="Enter your last name"></Input>
                {/* <ModelInput label="3D Model" id="model"></ModelInput> */}
                <PrintPlanner></PrintPlanner>
                <select id="filament" name="Material">
                    <option value="pla">PLA</option>
                    <option value="pla">PETG</option>
                    <option value="pla">ABS</option>
                    <option value="pla">PC</option>
                </select>
                <select id="color" name="Color">
                    <option value="white">White</option>
                    <option value="black">Black</option>
                </select>
            </form>
            {/* <StlViewer
                style={style}
                orbitControls={true}
                shadows={true}
                showAxes={true}
                allowFullScreen={true}
                onFinishLoading={onFinishLoading}
                onError={onError}
                onErrorCapture={onError as any}
                url={url}
                modelProps={{

                }}
                floorProps={{
                    gridLength: 4,
                    gridWidth: 4
                }}
            /> */}
        </div>
    )
}