"use client"

import { Input } from '@/app/components/Input';
import { InputBig } from '@/app/components/InputBig';
import { Navbar } from '@/app/components/Navigation'

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { requestPart } from '@/app/api/server-actions/request-part';

function SubmitButton() {
    let {pending} = useFormStatus();
    return (
        <div className="bg-white rounded-sm font-semibold p-14 pt-0 pb-10 w-full">
            <input type="submit" value={pending ? "Submitting Request..." : "Submit Request"}/>
        </div>
    )
}

export default function Request() {
    let [error, formAction] = useFormState<string, FormData>(requestPart, "");

    return (
        <main>
            <Navbar links={[
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Logout", path: "/user/logout"}
            ]}/>

            <form action={formAction}>
                <div className="bg-white rounded-sm p-14 pt-10 pb-10 w-full">
                    <h1 className="w-full pb-4 text-left">Request a Print</h1>

                    <Input label="Request Name" type="text" id="name" name="requestname" placeholder="Enter the name of the request"/>

                    <div className="font-semibold">
                        <p className="uppercase br-2">{"STL Part File"}</p>
                        <input
                            type="file" id="model" accept=".stl" name="file"
                            onChange={(elem) => console.log("Model submitted")}>
                        </input>
                    </div>

                    <div className="pt-3 pb-4">
                        <p className="uppercase font-semibold br-2">{"Filament"}</p>
                        <select id="filament" name="material">
                            <option value="pla">PLA</option>
                            <option value="petg">PETG</option>
                            <option value="abs">ABS</option>
                            <option value="pc">PC</option>
                        </select>
                        <select id="color" name="color">
                            <option value="white">White</option>
                            <option value="black">Black</option>
                        </select>
                    </div>

                    <InputBig label="Notes" id="notes" name="notes" placeholder="Anything else we should know?"/>
                </div>
                
                <SubmitButton/>  
                <p className="text-sm text-red-500">{error}</p>
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