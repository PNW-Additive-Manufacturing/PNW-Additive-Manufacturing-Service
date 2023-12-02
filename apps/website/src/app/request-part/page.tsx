"use client"

import { Input } from '@/app/components/Input';
import { InputBig } from '@/app/components/InputBig';
import { Navbar } from '@/app/components/Navigation'

import React from 'react';

export default function Request() {
    return (
        <main>
            <Navbar links={[
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Logout", path: "/logout"}
            ]}/>

            <form>
                <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                    <h1 className="w-full pb-4 text-left">Request a Print</h1>

                    <Input label="Request Name" type="text" id="name" placeholder="Enter the name of the request"/>

                    <div className="font-semibold">
                        <p className="uppercase br-2">{"STL Part File"}</p>
                        <input
                            type="file" id="model" accept=".stl"
                            onChange={(elem) => console.log("Model submitted")}>
                        </input>
                    </div>

                    <div className="pt-3 pb-4">
                        <p className="uppercase font-semibold br-2">{"Filament"}</p>
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
                    </div>

                    <InputBig label="Notes" id="notes" placeholder="Anything else we should know?"/>
                </div>
                <div className="bg-white rounded-sm font-semibold p-14 pt-0 pb-10 w-full">
                    <input type="submit" value="Submit Request"/>
                </div>  
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
        </main>
    )
}