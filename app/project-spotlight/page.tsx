"use server";

import { Suspense } from "react";
import HorizontalWrap from "../components/HorizontalWrap";
import Dynamic from "./Dynamic";

export default async function Page() {

    return <>

        <HorizontalWrap className="py-8">
            <h1 className="w-fit text-2xl font-normal mb-2">
                Project Spotlight
            </h1>
            <p className="">
                Curious about the possibilities of 3D printing? Discover the projects our club members have created!
            </p>
        </HorizontalWrap>
        <div className="bg-white min-h-screen">
            <HorizontalWrap className="py-8">
                
                <Suspense>

                    <Dynamic/>

                </Suspense>

            </HorizontalWrap>
        </div>


    </>;
}

