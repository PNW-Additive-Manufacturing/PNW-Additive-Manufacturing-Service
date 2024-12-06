"use client"

import { RegularDiamondAlt, RegularEye, RegularMagnifier } from "lineicons-react";
import HorizontalWrap from "../components/HorizontalWrap";
import { Project } from "./Project";

export default function Page() {
    return <>

        <HorizontalWrap>
            <h1 className="w-fit text-2xl font-normal mb-2"><RegularMagnifier className="inline mb-1 p-0.5 fill-pnw-gold" /> Project Spotlight</h1>
            <p className="mb-6">
                Wondering what 3D Printing could be used for? Learn about the projects our members have done!
            </p>
        </HorizontalWrap>
        <div className="bg-white h-screen">
            <HorizontalWrap>
                <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-12 mt-8">
                    <Project
                        title="Reviving the Spotify Car Thing"
                        author="Aaron Jung"
                        imageSrc="/assets/car_thing.jpg"
                        description="I bought a Spotify Car Thing in 2022 and used it regularly until it was discontinued. I decided to repurpose it using DeskThing and designed a custom 3D Printed mount for my monitor to keep it easily accessible on my desktop." />

                    <Project
                        title="Making an Electric Stakeboard"
                        author="Gabriel Jang"
                        imageSrc="/assets/gabe_skateboard.jpg"
                        description="" />
                </div>

            </HorizontalWrap>
        </div>

    </>;
}

