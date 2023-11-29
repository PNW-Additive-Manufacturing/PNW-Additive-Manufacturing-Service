"use client"

import { ChangeEventHandler, HTMLInputTypeAttribute, use, useEffect, useState } from "react"

import React from 'react';

function Input({ label, type, id, placeholder }: { label: string, type: HTMLInputTypeAttribute, id: string, placeholder: string }): JSX.Element {
    return (
        <div className="">
            <p className="uppercase font-semibold br-2">{label}</p>
            <input className="" id={id} type={type} placeholder={placeholder}></input>
        </div>
    )
}

export default function Request() {
    return (
        <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
            <h1 className="w-full text-center">Request a Print</h1>
            <form>
                <Input label="First Name" type="text" id="name" placeholder="Enter your first name"></Input>
                <Input label="Last Name" type="text" id="name" placeholder="Enter your last name"></Input>
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