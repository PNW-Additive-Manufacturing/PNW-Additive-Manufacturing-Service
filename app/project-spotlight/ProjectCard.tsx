"use client";

import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { ProjectSpotlight, ProjectSpotlightContent } from "../Types/ProjectSpotlight/ProjectSpotlight";
import { AccountContext } from "../ContextProviders";
import Link from "next/link";
import { RegularCheckmark, RegularCloudDownload, RegularFiles, RegularPencil, RegularStarFill } from "lineicons-react";
import FormSubmitButton from "../components/FormSubmitButton";
import { formateDate } from "../api/util/Constants";
import { useFormState } from "react-dom";
import { deleteProjectShowcase, editProjectShowcase } from "../api/server-actions/maintainer";
import { revalidatePath } from "next/cache";
import { toast } from "react-toastify";
import DropdownSection from "../components/DropdownSection";

export function ProjectCard(projectData: ProjectSpotlight) {
    const [isEditing, setIsEditing] = useState(false);

    const imageSrc = `/api/download/project-showcase-image/?projectId=${projectData.id as string}`;

    const accountContext = useContext(AccountContext);

    const [delete_res, delete_form] = useFormState<ReturnType<typeof deleteProjectShowcase>, FormData>(deleteProjectShowcase, null as any);

    const editFormRef = useRef<HTMLFormElement | undefined>(undefined);

    // function ProjectDownloadableContent({ content }: { content: ProjectSpotlightContent }) {
    //     const downloadURL = `/api/download/project-showcase-models/${projectData.id}/${content.fileName}`;

    //     return <tr className="opacity-75 hover:opacity-100 bg-background">
    //         <td className="text-sm text-cool-black fill-cool-black">
    //             <RegularFiles className="inline mr-1.5"></RegularFiles>
    //             {content.fileName}
    //         </td>
    //         <td className="text-sm">{content.downloads} Saves</td>
    //     </tr>
    // }

    return <div className="bg-white out shadow-sm rounded-md relative" key={projectData.id}>

        {imageSrc && <Image className="bg-background shadow-sm rounded-b-none rounded-t-sm" style={{ aspectRatio: "2/0.75" }} src={imageSrc} alt={"Image"} width={720} height={720}></Image>}

        <div className="p-6">
            {isEditing ? (
                <form ref={editFormRef as any} action={async (data) => {
                    try {
                        const edit_res = await editProjectShowcase(undefined!, data);

                        if (!edit_res?.success) throw new Error(edit_res?.errorMessage || "An issue occurred editing showcase!");

                        // Clear the form
                        if (editFormRef.current) editFormRef.current.reset();

                        // Exit editing mode
                        setIsEditing(false);

                        toast.success("Post has been successfully changed!");

                    } catch (error) {
                        console.error("An error occurred during form submission:", error);
                        toast.error((error as Error).message || "An unexpected error occurred.");
                    }
                }}>
                    <input
                        type="string"
                        name="projectId"
                        id="projectId"
                        readOnly
                        hidden
                        value={projectData.id}
                        defaultValue={projectData.id}
                    />

                    <h2 className="font-medium text-lg flex items-center justify-between gap-4">
                        <input
                            title="Title"
                            className="text-sm mb-0"
                            type="text"
                            name="title"
                            defaultValue={projectData.title}
                        />
                        {accountContext.isSingedIn &&
                            accountContext.account!.permission !== "user" && (
                                <RegularCheckmark
                                    className="inline hover:cursor-pointer"
                                    onClick={() => setIsEditing(false)}
                                />
                            )}
                    </h2>

                    <input
                        title="Author"
                        className="text-sm mt-4"
                        type="text"
                        name="author"
                        defaultValue={projectData.author}
                    />
                    <textarea
                        title="Description"
                        className="text-sm mt-4"
                        defaultValue={projectData.description}
                        name="description"
                        style={{ minHeight: "8rem" }}
                    ></textarea>

                    <div className="mt-4 md:flex gap-4 w-full">
                        <FormSubmitButton
                            label="Save Changes"
                            className="text-sm"
                        />
                    </div>
                </form>
            ) : (
                <>
                    <h2 className="font-semibold text-lg flex items-center justify-between gap-4">
                        <>{projectData.title}</>
                        {accountContext.isSingedIn &&
                            accountContext.account!.permission !== "user" && (
                                <RegularPencil
                                    className="inline opacity-25 hover:opacity-100 hover:cursor-pointer p-0.5"
                                    onClick={() => setIsEditing(true)}
                                />
                            )}
                    </h2>

                    {projectData.author && (
                        <p className="text-sm mt-1 mb-4">
                            Published by {projectData.author} on{" "}
                            {formateDate(projectData.createdAt)}.
                        </p>
                    )}

                    <hr className="pb-0 mb-4" />

                    <p className="text-base text-cool-black">{projectData.description}</p>
                </>
            )}

            {/* <DropdownSection name={"2 Downloadable Files"} className="p-0 py-0 px-0 text-sm font-light mt-4" hidden={true}>
                <table className="w-full rounded-md mt-2">
                    <tbody>
                        <ProjectDownloadableContent content={{ fileName: "Car Thing Mount 15 DEG.STL", downloads: 12 }} />
                        <ProjectDownloadableContent content={{ fileName: "Car Thing Mount 25 DEG.STL", downloads: 30 }} />
                    </tbody>
                </table>
            </DropdownSection> */}

            {/* <label className="mt-2">Downloadable Content</label> */}

            {isEditing && (
                <form action={delete_form} className="w-full">
                    <input
                        type="string"
                        name="projectId"
                        readOnly
                        hidden
                        value={projectData.id}
                    />
                    <FormSubmitButton
                        label="Delete from Spotlight"
                        className="opacity-50 bg-red-800 hover:bg-red-500 hover:opacity-100 mb-0 text-sm"
                    />
                </form>
            )}

            {/* <div>
                <Link href={"/api/download/project-showcase-models"}>
                    <div className="w-full opacity-75 hover:opacity-100 group py-2 px-3 rounded-md bg-background hover:bg-pnw-gold fill-black hover:fill-white hover:text-white flex justify-between gap-2 items-center flex-wrap text-sm">
                        <div className="flex gap-2 items-center">
                            <RegularFiles></RegularFiles>
                            <span>Car Thing Mount.<span className="uppercase">STL</span></span>
                            <span> 21 Downloads</span>
                        </div>
                    </div>
                </Link>
            </div> */}
        </div>

    </div>;
}
