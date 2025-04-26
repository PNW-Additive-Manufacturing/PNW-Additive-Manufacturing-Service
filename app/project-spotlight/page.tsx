"use server";

import { RegularCirclePlus, RegularDiamondAlt, RegularEye, RegularMagnifier } from "lineicons-react";
import HorizontalWrap from "../components/HorizontalWrap";
import { ProjectCard } from "./ProjectCard";
import db from "@/app/api/Database";
import ProjectSpotlightServe from "../Types/ProjectSpotlight/ProjectSpotlightServe";
import { retrieveSafeJWTPayload } from "../api/util/JwtHelper";
import { CreateProject } from "./CreateProject";
import { Metadata, ResolvingMetadata } from "next";

export default async function Page() {

    const JWTPayload = await retrieveSafeJWTPayload();
    const showcases = await ProjectSpotlightServe.queryAllProjectShowcases();
    await ProjectSpotlightServe.withManyAttachments(showcases);

    return <>

        <HorizontalWrap className="py-8">
            <h1 className="w-fit text-2xl font-normal mb-2">
                {/* <RegularMagnifier className="inline mb-1 p-0.5 fill-pnw-gold" />{" "} */}
                Project Spotlight
            </h1>
            <p className="">
                Curious about the possibilities of 3D printing? Discover the projects our club members have created!
            </p>
        </HorizontalWrap>
        <div className="bg-white min-h-screen">
            <HorizontalWrap className="py-8">
                <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-8 pb-8">

                    {showcases.map(s => <div key={s.id} className="bg-background rounded-md"><ProjectCard style="normal" editable={true} projectData={s} /></div>)}

                    {JWTPayload && JWTPayload.permission !== "user" && <CreateProject />}
                </div>

            </HorizontalWrap>
        </div>


    </>;
}

