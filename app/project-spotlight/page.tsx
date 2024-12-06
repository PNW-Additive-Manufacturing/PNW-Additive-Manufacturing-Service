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
        <div className="bg-white">
            <HorizontalWrap>
                <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-8 py-8">
                    <Project
                        title="Reviving the Spotify Car Thing"
                        author="Aaron Jung"
                        imageSrc="/assets/car_thing.jpg"
                        description="Aaron bought a Spotify Car Thing in 2022 and used it regularly until it was discontinued. He decided to repurpose it using DeskThing and designed a custom 3D Printed mount for his monitor to keep it easily accessible." />

                    <Project
                        title="Building a Battle Bot"
                        author="Luke Moreno"
                        imageSrc="/assets/luke_moreno_battle_bot_2.jpg"
                        description="Luke uses ABS & TPU filament to encase the electronics of his three-pound Battle Bot. This durable material offers excellent impact resistance. It helps soften blows from opposing weapons during battles." />

                    <Project
                        title="IEEE Welcome Rally Tags"
                        author="Anhviet Le"
                        imageSrc="/assets/ieee_tags.jpg"
                        description="Le leverages 3D Printing to craft custom tags for the IEEE chapter at PNW for the Welcome Rally. You've probably seen these around campus on backpacks!" />

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

