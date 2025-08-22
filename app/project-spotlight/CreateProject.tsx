"use client";

import { RegularCirclePlus } from "lineicons-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../components/Input";
import Image from "next/image";
import HiddenInput from "../components/HiddenInput";
import { formateDate } from "../api/util/Constants";
import { useFormState } from "react-dom";
import { postProjectShowcase } from "../api/server-actions/maintainer";
import { APIData } from "../api/APIResponse";
import FormSubmitButton from "../components/FormSubmitButton";

export function CreateProject() {
    const [isEditing, setEditing] = useState(false);
    const [inputImage, setInputImage] = useState<string | undefined>(undefined);
    let [res, formInvoke] = useFormState<ReturnType<typeof postProjectShowcase>, FormData>(postProjectShowcase, null as any);

    // Editing mode is essentially a form version of the Project component.
    return <div className={`bg-white out shadow-sm rounded-md font-light ${!isEditing && "opacity-50 hover:opacity-100"} hover:cursor-pointer`} onClick={() => setEditing(true)} style={{ minHeight: "10rem" }}>
        {isEditing ? <>
            <form action={formInvoke}>
                <HiddenInput onChange={(ev) => setInputImage(URL.createObjectURL(ev))} id="image" name="image" type="file" accept="image/jpeg" required>
                    {inputImage == undefined
                        ? <div className="bg-gray-200 rounded-b-none rounded-t-sm flex items-center justify-center h-40">Click to upload Image</div>
                        : <Image className="bg-background shadow-sm rounded-b-none rounded-t-sm" style={{ aspectRatio: "72 / 35", objectFit: "cover" }} src={inputImage} alt={"Image"} width={720} height={350}></Image>}
                </HiddenInput>

                <div className="p-6">
                    <div className="flex gap-4">
                        <Input label={"Title"} type={"string"} id={"title"} placeholder="Designing a..." required />
                        <Input label={"Author"} type={"string"} id={"author"} placeholder="Leo the Lion" required></Input>
                    </div>

                    <p className="text-sm mb-3">Publishing on {formateDate(new Date())}</p>

                    <label>Content</label>
                    <textarea className="lg:text-sm" aria-label="Content" id="description" name="description" style={{ minHeight: "6rem" }} required placeholder="Loe the Lion utilizes 3D Printing to make his sculpture!"></textarea>

                    <FormSubmitButton label="Publish to Spotlight" className="mb-0 text-left text-sm"></FormSubmitButton>
                    {res && !res.success && res.errorMessage && <p className="text-red-400">{res.errorMessage}</p>}
                </div>
            </form>

        </> : <div className="flex flex-col gap-3 items-center justify-center w-full h-full p-6">

            <h2 className="text-base">Create another Post</h2>
            <RegularCirclePlus className="fill-pnw-gold w-6 h-6"></RegularCirclePlus>

        </div>}
    </div>
}