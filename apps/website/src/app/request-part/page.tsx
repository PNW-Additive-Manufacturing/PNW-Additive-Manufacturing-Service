"use client"

import { Input } from '../components/Input';
import { Navbar } from '../components/Navigation'

import React from 'react';

export default function Request() {
    return (
        <main>
            <Navbar links={[]}/>

            <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                <h1 className="w-full text-center">Request a Print</h1>
                <form>
                    <Input label="First Name" type="text" id="name" placeholder="Enter your first name"/>
                    <Input label="Last Name" type="text" id="name" placeholder="Enter your last name"/>
                    <input
                        type="file"
                        id="model"
                        accept=".stl"
                        onChange={(elem) => console.log("Model submitted")}>
                    </input>
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
                    <input type="submit" value="Submit Request"/>
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
        </main>
        
    )
}