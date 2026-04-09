"use client"

import { submitOrder } from "@/app/api/server-actions/Order";
import { ManufacturingMethod } from "@/app/Types/ManufacturingMethod/ManufacturingMethod";
import classNames from "classnames";
import { RegularSpinnerSolid } from "lineicons-react";
import React, { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FaA, FaArrowRight, FaClock, FaCloudArrowUp, FaEllipsis, FaFont, FaHashtag, FaLayerGroup, FaLocationArrow, FaSquarePlus, FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { BufferGeometry, Vector3 } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import IconByName from "../components/IconByName";
import InvisibleFileInput, { InvisibleFileInputHandle } from "../components/InvisibleFileInput";
import QuantitySelector from "../components/QuantitySelector";
import { styleCSSSwatch, Swatch, SwatchConfiguration } from "../components/Swatch";
import ThreeModelViewer from "../components/ThreeModelViewer";
import Timeline from "../components/Timeline";
import Filament, { getUniqueManufacturingMethods, getUniqueMaterials } from "../Types/Filament/Filament";
import { Material } from "../Types/Material/Material";
import { formatBytes } from "../utils/StringUtils";

const uploadLimitInBytes = 99 * Math.pow(10, 6); // 99 MB

export default function RequestPart({ filaments }: { filaments: Filament[] }) {

    const [stage, setStage] = useState<1 | 2 | 3>(1);

    const [modelSelection, setModelSelection] = useState<ModelSelection>();
    const [selectedParts, setSelectedParts] = useState<PartForSubmission[]>();
    const [submitError, setSubmitError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();

    return <>

        {/* <div className="flex items-center font-light gap-1 text-sm mb-6">

            <p>Upload Models</p>

            <div><FaChevronRight className="p-0.5" /></div>

            <p>Manufacturing Method</p>

            <div><FaChevronRight className=" p-0.5" /></div>

            <p className="text-pnw-gold">Choose Parts</p>

            <div><FaCaretRight /></div>

        </div> */}

        <div className="grid gap-8 grid-cols-4">

            <div className="col-span-1 flex flex-col gap-4">

                <Surface>

                    <Timeline options={[
                        { title: "Select 3D Models", description: (modelSelection ? modelSelection.uploadedModels.length > 0 ? `${modelSelection.uploadedModels.length} Model(s)` : undefined : "Using Previous Models"), disabled: !(stage > 1) },
                        { title: "Parts to Manufacture", disabled: !(stage >= 2), description: selectedParts ? `${selectedParts.length} Part(s)` : undefined },
                        { title: "Review & Submit", disabled: !(stage >= 3) },
                    ]} />

                </Surface>

                <Surface>

                    <Snibbit icon={<FaLocationArrow />} text="Lab Information">

                        <p className="text-sm">All items are for pickup at the PNW Design Studio. Advising and pickup are available during student work hours. You will be notified via email when your order is ready. </p>

                    </Snibbit>

                </Surface>

            </div>

            <div className="col-span-3">
                <Surface gap={8}>

                    {stage === 1 && <Upload3DModels onNext={(models) => { setStage(2); setModelSelection(models); }} existingState={modelSelection} />}
                    {stage === 2 && modelSelection && <PartSelection
                        materials={filaments}
                        defaultValue={selectedParts}
                        modelSelection={modelSelection}
                        onNext={parts => { setStage(3); setSelectedParts(parts); }}
                        onCancel={() => setStage(1)} />}

                    {stage === 3 && selectedParts && <>

                        <FinalizeOrder
                            partsForSubmission={selectedParts}
                            onCancel={() => setStage(2)}
                            isPending={isPending}
                            submitError={submitError}
                            onNext={(orderName, requiredBy, comments) => {
                                setSubmitError(undefined);
                                startTransition(async () => {
                                    const fd = new FormData();
                                    fd.append("orderName", orderName);
                                    fd.append("requiredBy", requiredBy.toISOString());
                                    fd.append("comments", comments);

                                    const uniqueModels = Array.from(
                                        new Map(
                                            selectedParts.map(p => [p.model.fileName, p.model])
                                        ).values()
                                    );
                                    uniqueModels.forEach(m => fd.append("models", m.file));

                                    selectedParts.forEach(part => {
                                        fd.append("modelIndex", String(uniqueModels.findIndex(m => m.fileName === part.model.fileName)));
                                        fd.append("filamentId", String(part.filament.id));
                                        fd.append("quantity", String(part.quantity));
                                        fd.append("partName", part.name);
                                        fd.append("specialInstruction", part.specialInstruction ?? "");
                                    });

                                    const result = await submitOrder(fd);
                                    if (result?.error) setSubmitError(result.error);
                                });
                            }} />

                    </>}

                </Surface>
            </div>

        </div >

    </>
}

function FinalizeOrder({ partsForSubmission, onCancel, onNext, isPending, submitError }: { partsForSubmission: PartForSubmission[], isPending?: boolean, submitError?: string } & Navigation<(orderName: string, requiredBy: Date, comments: string) => void>) {

    const [orderName, setOrderName] = useState<string | undefined>();
    const [expectedBy, setExpectedBy] = useState<Date | undefined>();
    const [comments, setComments] = useState<string>("");
    const currentDate = useDate();

    const leadTimeInDays = useMemo(() => Math.max(...partsForSubmission.map(p => p.filament.leadTimeInDays)), [partsForSubmission]);
    const minExpectedBy = useMemo(() => {
        const msPerDay = 1000 * 60 * 60 * 24;
        return new Date(currentDate.getTime() + msPerDay * leadTimeInDays);
    }, [currentDate, leadTimeInDays]);
    const methodsInUse = useMemo(() => getUniqueManufacturingMethods(partsForSubmission.map(p => p.filament)), [partsForSubmission]);

    // console.log(expectedBy, minExpectedBy, expectedBy > minExpectedBy);

    return <>

        <Slide
            title={"Complete Order"}
            description={"You're almost there! Review the estimates below, select your expected completion date, and submit your order."}
            nextEnabled={!isPending && orderName != null && orderName.length > 0 && expectedBy != null && expectedBy > minExpectedBy}
            onCancel={onCancel}
            nextText={isPending ? "Submitting..." : "Submit Order"}
            onNext={() => onNext(orderName!, expectedBy!, comments)}
            cancelText="Go Back to Parts">

            <div >

                <Snibbit text={"When do you require these items?"} icon={<FaClock />} className="mb-3 w-full" />

                <input type="datetime-local" placeholder="Select a Date" required min={formatDateToYYYYMMDD(minExpectedBy)} className={classNames("mb-2 w-full", { "text-warning": expectedBy != null && minExpectedBy > expectedBy })} onChange={(ev) => setExpectedBy(fromLocalDateHTMLInput(ev.currentTarget.valueAsDate ?? ev.currentTarget.value))} />

                {/* <p className="button hover:underline" onClick={() => setExpectedBy(new Date(minExpectedBy.getTime() + 1000 * 5))}>Use Minimum Lead-Time</p> */}

                <p className={classNames("font-light", { "text-warning": expectedBy != null && minExpectedBy > expectedBy })}>With what you've selected, our minimum lead-time is {leadTimeInDays} Day(s).</p>

                <div className="flex flex-wrap gap-2 mt-3 items-center">

                    <p className="font-light text-sm">Methods in this order:</p>

                    {methodsInUse.map(m => <span key={m.wholeName} className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 border border-black/5">{m.shortName}</span>)}

                </div>

            </div>

            <div>

                <Snibbit text={"Order Name"} icon={<FaA />} className="mb-3" />

                <input type="text" required placeholder="e.g., Leo Lion Senior Project - Chassis V2" className="mb-2 w-full" onChange={(ev) => setOrderName(ev.currentTarget.value)} />

                <p className="font-light">Choose a unique name that makes your order easy to identify.</p>

            </div>

            <div>

                <Snibbit text={"Additional Comments"} className="mb-3" />

                <textarea className="mb-2 w-full" value={comments} onChange={(ev) => setComments(ev.currentTarget.value)} />

            </div>

            {submitError && <p className="text-warning font-light">{submitError}</p>}

            {/* <div className="bg-gray-50 p-6 rounded-md">

                <Snibbit text={"Estimated Cost"} className="text-xl font-semibold mb-2" />

                <p className="mb-4">This is an experimental estimate based on material and machine time. Expect the quoted price to exceed this amount.</p>

                <p className="text-2xl font-bold">${(13.50).toFixed(2)}</p>

                <div className="w-1/2">

                    <Skeleton height={32} />

                </div>

            </div> */}

            <div className="w-full bg-gray-100" style={{ height: "3px" }} />

            <div>

                <Snibbit className="mb-2" text={"Final Steps"} />

                <ol className="list-decimal gap-3 flex flex-col font-light">

                    <li>You'll receive an <strong>Email Notification</strong> once your order has been quoted.</li>
                    <li><strong>Printing will not begin until the quote has been paid.</strong> Review and pay the quote from your dashboard to start production.</li>
                    <li>Once your order is ready, you'll receive another <strong>Email Notification</strong> letting you know it's available for pickup.</li>
                    <li>To pickup find an available officer (see our <strong><Link className="underline" href={"/team"} target="_blank">Team Page</Link></strong>) to get your package.</li>

                </ol>
            </div>

            <div className="w-full bg-gray-100" style={{ height: "3px" }} />

        </Slide>

    </>
}

interface Navigation<Next = () => void, Cancel = () => void> {
    onNext: Next,
    onCancel: Cancel
};

type PartForSubmission = {
    name: string,
    quantity: number,
    model: UploadedModel,
    filament: Filament,
    specialInstruction?: string
};

type OrderForSubmission = {

    models: UploadedModel[],
    parts: (Omit<PartForSubmission, "model"> & ({ modelName: string } | { existingModelID: string }))[],
    requiredBy: Date,
    orderName: string

};

function FilamentSelector({ defaultValue, method, filaments, onSelect }: { filaments: Filament[], defaultValue?: Filament, method?: ManufacturingMethod, onSelect: (filament: Filament | undefined) => void; }) {

    const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>(defaultValue?.material);
    const [selectedFilament, setSelectedFilament] = useState<Filament | undefined>(defaultValue);

    const filamentsOfMethod = useMemo(() => method ? filaments.filter(f => f.manufacturingMethod.wholeName === method.wholeName) : [], [filaments, method]);

    if (!method) return null;

    return <>

        <div>

            <Snibbit icon={<FaLayerGroup />} text={`Choose Material (${method.shortName})`} className="mb-2" />

            <div className="grid grid-cols-3 w-full gap-5">

                {getUniqueMaterials(filamentsOfMethod).map(m => <>

                    <Card
                        key={m.wholeName}
                        showSelect={true}
                        onSelect={() => { setSelectedMaterial(m); setSelectedFilament(undefined); onSelect(undefined); }}
                        selected={m.wholeName === selectedMaterial?.wholeName}
                        title={m.shortName}
                        description={m.description}
                        cons={m.cons}
                        benefits={m.benefits}
                        learnMoreURL={m.learnMoreURL} />

                </>)}

            </div>

        </div>

        {selectedMaterial && <div className="flex gap-4">

            {filamentsOfMethod.filter(f => f.manufacturingMethod.shortName === method.shortName && f.material.shortName === selectedMaterial.shortName).map(f => <>

                <div key={f.color.name} className="flex gap-1 w-16 flex-col hover:cursor-pointer items-center transition-transform group hover:-translate-y-0.5" onClick={() => { setSelectedFilament(f); onSelect(f); }}>

                    <div

                        className={classNames("w-14 h-14 flex items-center justify-center rounded-lg p-0.5 border-3  group-hover:border-pnw-gold", { "border-pnw-gold": selectedFilament === f })}
                        style={styleCSSSwatch(f.color)}>

                        {selectedFilament === f && <FaCheck className="fill-pnw-gold" />}

                    </div>

                    <p className={classNames("text-sm group-hover:text-pnw-gold text-center", { "font-medium text-pnw-gold": selectedFilament === f })}>{f.color.name}</p>

                </div>

            </>)}

        </div>}

    </>
}

function PartSelectionMetadataStage({ selectedPart, onCancel, onNext, isEditing }: { selectedPart: Pick<PartForSubmission, "model" | "filament"> & Partial<PartForSubmission>, isEditing?: boolean } & Navigation<(submission: PartForSubmission) => void>) {

    const [quantity, setQuantity] = useState<number | undefined>(selectedPart.quantity ?? 1);
    const [specialInstructions, setSpecialInstructions] = useState<string | undefined>(selectedPart.specialInstruction);
    const [name, setName] = useState<string>(selectedPart.name ?? selectedPart.model.name);

    return <>

        <Slide
            title={"Part Options"}
            titleSide={<SlideSideThreeModelViewer model={selectedPart.model} color={selectedPart.filament.color} />}
            description={"To order multiple units, use the quantity selector below. Please include any special requirements in the comments section, such as multi-color specifications, enhanced strength properties, or other requirements."}
            nextEnabled={quantity !== undefined}
            cancelText={isEditing ? "Cancel" : "Go Back to Materials"}
            nextText={isEditing ? `Update Part` : `Add ${name}`}
            onNext={() => onNext({ ...selectedPart, quantity: quantity!, specialInstruction: specialInstructions, name })}
            onCancel={onCancel}>

            <div className="flex flex-col lg:flex-row gap-6">

                <div className="w-full">

                    <Snibbit icon={<FaFont />} text={"Part Name"} className="mb-2" />
                    <input defaultValue={name} className="mb-0 h-12 border-2" onChange={(ev) => setName(ev.currentTarget.value)} />

                </div>

                <div>

                    <Snibbit icon={<FaHashtag />} text={"Print Quantity"} className="mb-2" />
                    <QuantitySelector value={selectedPart?.quantity ?? 1} min={1} max={100} onChange={setQuantity} />

                </div>

            </div>

            <div>

                <Snibbit text={`Special Instructions`} className="mb-2" />

                <textarea
                    defaultValue={selectedPart?.specialInstruction}
                    className="w-full min-h-32 mb-0"
                    placeholder="Add any special instructions, notes about prototyping vs finalized parts, or other requirements."
                    onChange={(ev) => setSpecialInstructions(ev.currentTarget.value)} />

            </div>


        </Slide>

    </>
}

function SlideSideThreeModelViewer({ model, color }: { model: PartForSubmission["model"], color?: SwatchConfiguration }) {

    return <>

        {model.geometry?.threeGeometry && <div className="aspect-square w-[6rem] rounded-lg">

            <ThreeModelViewer style="" geometry={model.geometry.threeGeometry} swatch={color} />

        </div>}

    </>
}

function PartSelectionConfigureStage({ selectedPart, materials, onNext, onCancel, isEditing }: { materials: Filament[], selectedPart: Pick<PartForSubmission, "model"> & Partial<PartForSubmission>, onCancel: () => void, onNext: (part: Pick<PartForSubmission, "model" | "filament">) => void, isEditing?: boolean }) {

    const [selectedMethod, setSelectedMethod] = useState<ManufacturingMethod | undefined>(selectedPart.filament?.manufacturingMethod);
    const [selectedFilament, setSelectedFilament] = useState<Filament | undefined>(selectedPart.filament);

    const availableMethods = useMemo(() => getUniqueManufacturingMethods(materials), [materials]);

    return <>

        <Slide
            title={"Part Material"}
            titleSide={<SlideSideThreeModelViewer model={selectedPart.model} color={selectedFilament?.color} />}
            description={"Choose a manufacturing method for this part, then pick the material and color. Each part in your order may use a different method."}
            nextEnabled={selectedFilament !== undefined}
            onNext={() => onNext({ ...selectedPart, model: selectedPart.model, filament: selectedFilament! })}
            onCancel={onCancel}
            nextText={isEditing ? "Update Material" : "Next Step"}
            cancelText={isEditing ? "Cancel" : undefined}
            nextHelperText={isEditing ? undefined : "Choose a Method, Material & Color"}>

            <div>

                <Snibbit icon={<FaLayerGroup />} text={"Choose Manufacturing Method"} className="mb-2" />

                <div className="grid grid-cols-3 gap-6">

                    {availableMethods.map(m => <DisplayManufacturingMethod
                        key={m.wholeName}
                        method={m}
                        selected={m.shortName === selectedMethod?.shortName}
                        onClick={() => {
                            if (m.shortName === selectedMethod?.shortName) return;
                            setSelectedMethod(m);
                            setSelectedFilament(undefined);
                        }}
                        filaments={materials} />)}

                </div>

            </div>

            <FilamentSelector filaments={materials} method={selectedMethod} defaultValue={selectedFilament} onSelect={f => setSelectedFilament(f)} />

        </Slide>

    </>
}

function PartSelectionChooseModel({ modelSelection, onSelect, onCancel, partCount }: { partCount: number, modelSelection: ModelSelection, onCancel: () => void, onSelect: (model: UploadedModel) => void; }) {

    const [chosenModel, setChosenModel] = useState<UploadedModel>();

    return <>

        <Slide
            title={"Choose Model"}
            description={"Select the model you'd like to utilize for the next Part."}
            nextEnabled={chosenModel !== undefined}
            onNext={() => onSelect?.(chosenModel!)}
            nextText={chosenModel ? `Choose ${chosenModel.name}` : "Choose Model"}
            onCancel={onCancel}>

            <div>

                <Snibbit icon={<FaCloudArrowUp />} text={"Uploaded Models"} className="mb-2" />

                <div className="grid gap-4 grid-cols-2">

                    {modelSelection.uploadedModels.map(model => <ModelDia
                        selected={true}
                        key={model.fileName}
                        uploadModel={model}
                        onSelect={() => { setChosenModel(model); onSelect(model); }} />)}

                </div>

            </div>

        </Slide>

    </>
}

import Link from "next/link";
import { createPortal } from 'react-dom';
import useClickedOutside from "../hooks/useClickedOutside";
import useDate from "../hooks/useDate";
import { uniqueBy } from "../utils/ArrayUtils";
import { formatDateToYYYYMMDD, fromLocalDateHTMLInput } from "../utils/JSDateUtils";

function DropdownMenu({ children, isShown }: React.PropsWithChildren<{ isShown: boolean }>) {

}

function ContextMenu({ children, dropdown }: React.PropsWithChildren<{ dropdown: React.ReactElement }>) {
    const [isShown, setIsShown] = useState(false);
    const [coords, setCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isContextMenu, setIsContextMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickedOutside(menuRef, () => {

        if (isShown) {
            setIsShown(false);
            setIsContextMenu(false);
            console.log("Bleh");
        }

    }, [isShown]);

    const contextMenuContent = isContextMenu && isShown ? (
        <div
            ref={menuRef}
            className="fixed z-50"
            style={{
                left: `${coords.x}px`,
                top: `${coords.y}px`
            }}
        >
            <div
                className="w-fit min-w-[200px] border-2 border-black/10 bg-white p-3 drop-shadow-xl rounded-lg flex gap-2 flex-col scale-105 transition-transform"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsShown(false);
                    setIsContextMenu(false);
                }}
            >
                {dropdown}
            </div>
        </div>
    ) : null;

    return (
        <>
            <div className="relative inline-block" ref={menuRef}>
                <div
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsContextMenu(false);
                        setIsShown(prev => !prev);
                    }}
                    onContextMenu={(e) => {

                        e.preventDefault();
                        e.stopPropagation();
                        setCoords({ x: e.clientX, y: e.clientY });
                        setIsContextMenu(true);
                        setIsShown(true);
                    }}
                >
                    {children}
                </div>

                {isShown && !isContextMenu && (
                    <div className="absolute right-0 top-full mt-2 z-50">
                        <div
                            className="w-fit min-w-[200px] border-2 border-black/10 bg-white p-3 drop-shadow-xl rounded-lg flex gap-2 flex-col scale-105 transition-transform"
                            onClick={(e) => {
                                // e.stopPropagation();
                                setIsShown(false);
                                setIsContextMenu(false);
                            }}
                        >
                            {dropdown}
                        </div>
                    </div>
                )}
            </div>

            {contextMenuContent && createPortal(contextMenuContent, document.body)}
        </>
    );
}

function ContextActionMenu({ children, actions }: React.PropsWithChildren<{ actions: { name: string, icon: React.ReactElement, action: () => void; style: "regular" | "warning" }[] }>) {
    return <>

        <ContextMenu dropdown={<>

            {actions.map(action => <div key={action.name} className={classNames(
                "transition-none button text-sm flex gap-2 items-center hover:text-pnw-gold hover:[&>*]:fill-pnw-gold hover:fill-pnw-gold font-medium hover:font-semibold",
                { "hover:text-warning hover:[&>*]:fill-warning hover:fill-warning": action.style === "warning" }
            )} onClick={action.action}>

                {action.icon}

                {action.name}

            </div>)}

        </>}>

            {children}

        </ContextMenu>

    </>
}

function PartSelection({ onCancel, onNext, modelSelection, materials, defaultValue }: { defaultValue?: PartForSubmission[], modelSelection: ModelSelection, materials: Filament[], onCancel?: () => void, onNext?: (parts: PartForSubmission[]) => void }) {

    const [selectedParts, setSelectedParts] = useState<PartForSubmission[]>(defaultValue ?? []);
    const [isSelectingModel, setIsSelectingModel] = useState(false);
    const [modifyingPart, setModifyingPart] = useState<{ stage: 1 | 2 | 3, insertAt?: number, submission: Partial<PartForSubmission> & Pick<PartForSubmission, "model"> }>();

    return <>

        {!isSelectingModel && !modifyingPart && <>

            {/* To continue, one or more parts must be completed. */}

            <Slide
                title={"Parts to Manufacture"}
                description={"In this step, select the model you'd like to print or choose an existing part to modify or remove. Each part has its own manufacturing method, quantity, and filament settings, so you can mix methods or reuse the same model in different colors, materials, or amounts."}
                nextEnabled={selectedParts.length > 0}
                nextHelperText="Add one or more Parts"
                nextText="Finalize Order"
                cancelText="Go Back to Files"
                onNext={() => onNext?.(selectedParts)}
                onCancel={onCancel}>

                <div>

                    <div className="grid grid-cols-3 gap-6 flex-wrap">

                        {selectedParts.map((p, i) => <>

                            <ContextActionMenu key={p.name} actions={[

                                { name: "Change Material", icon: <FaLayerGroup />, action: () => setModifyingPart({ submission: p, insertAt: i, stage: 1 }), style: "regular" },
                                { name: "Change Options", icon: <FaHashtag />, action: () => setModifyingPart({ submission: p, insertAt: i, stage: 2 }), style: "regular" },
                                { name: "Delete", icon: <FaTrash />, action: () => setSelectedParts(prev => prev.filter((pp, pi) => pi !== i)), style: "warning" },

                            ]}>

                                <div
                                    className="w-full group transition-transform shadow-sm hover:-translate-y-1 rounded-lg border-2 border-black/10 bg-white">

                                    <div className="h-32 w-full rounded-t-lg p-2 bg-background relative">

                                        {p.model.geometry?.threeGeometry && <ThreeModelViewer style="" geometry={p.model.geometry.threeGeometry} swatch={p.filament.color} />}

                                    </div>

                                    <div className="rounded-b-lg p-5 flex flex-col gap-2 text-sm">

                                        <div className="flex flex-wrap items-center w-full text-base gap-3 justify-between">

                                            <p className="font-semibold break-words flex-1 min-w-0">{p.name}</p>

                                            <div className="hidden group-hover:block button">

                                                <FaEllipsis />

                                            </div>

                                        </div>

                                        <div className="flex justify-between">

                                            <p className="font-light">Quantity</p>

                                            <p>x{p.quantity}</p>

                                        </div>

                                        <div className="flex justify-between">

                                            <p className="font-light">Method</p>

                                            <p className="font-medium">{p.filament.manufacturingMethod.shortName}</p>

                                        </div>

                                        <div className="flex justify-between">

                                            <p className="font-light">Material</p>

                                            <p>{p.filament.material.shortName} {p.filament.color.name}<span className="ml-1.5"><Swatch style="compact" swatch={p.filament.color} /></span></p>

                                        </div>

                                        {p.model.geometry?.dimensions && <div className="flex justify-between">

                                            <p className="font-light">Dimensions</p>

                                            {<p className="w-fit">{p.model.geometry.dimensions.string}</p>}

                                        </div>}

                                        {p.specialInstruction && p.specialInstruction.length > 0 && <p>Includes Instructions</p>}

                                    </div>

                                </div>

                            </ContextActionMenu>

                        </>)}

                        <div className="hover:cursor-pointer w-full h-full col-span-full" onClick={() => setIsSelectingModel(true)}>

                            <OutlinedInstructionPanel
                                title={"Add to Order"}
                                descriptions={["Configure material and colors", "Models may be added to multiple parts"]}
                                icon={<FaSquarePlus />}
                            />

                        </div>

                    </div>

                </div>

            </Slide>

        </>}

        {/* Prompt to select a model. THEN partial insert into modifyingPart.  */}

        {isSelectingModel && <PartSelectionChooseModel
            partCount={selectedParts.length}
            modelSelection={modelSelection}
            onSelect={(model) => { setModifyingPart({ stage: 1, submission: { model: model } }); setIsSelectingModel(false); }}
            onCancel={() => setIsSelectingModel(false)} />}

        {/* Displayed once an initial model has been selected above. */}

        {modifyingPart && <>

            {modifyingPart.stage === 1 && <PartSelectionConfigureStage
                materials={materials}
                selectedPart={modifyingPart.submission}
                isEditing={modifyingPart.insertAt != null}
                onCancel={() => {
                    if (modifyingPart.insertAt != null) {
                        setModifyingPart(undefined);
                    } else {
                        setModifyingPart(undefined);
                        setIsSelectingModel(true);
                    }
                }}
                onNext={p => {
                    if (modifyingPart.insertAt == null) {
                        setModifyingPart({ submission: p, stage: 2 });
                    }
                    else {
                        setSelectedParts(prev => prev.map((current, i) => i === modifyingPart.insertAt ? p as PartForSubmission : current));
                        setModifyingPart(undefined);
                    }
                }} />}

            {modifyingPart.stage === 2 && modifyingPart.submission.filament && <PartSelectionMetadataStage
                selectedPart={modifyingPart.submission as any}
                isEditing={modifyingPart.insertAt != null}
                onCancel={() => {
                    if (modifyingPart.insertAt != null) {
                        setModifyingPart(undefined);
                    } else {
                        setModifyingPart(prev => ({ ...prev!, stage: 1 }));
                    }
                }}
                onNext={p => {
                    if (modifyingPart.insertAt == null) {
                        setSelectedParts(prev => [...prev, p]);
                        setModifyingPart(undefined);
                    }
                    else {
                        setSelectedParts(prev => prev.map((current, i) => i === modifyingPart.insertAt ? p as PartForSubmission : current));
                        setModifyingPart(undefined);
                    }
                }} />}

        </>}

    </>
}

function Card(props: { icon?: React.ReactElement, showSelect: boolean, selected: boolean, title: string | React.ReactElement, titleRight?: string, description: string, cons?: string[], benefits?: string[], learnMoreURL?: string, learnMoreText?: string, onSelect?: () => void; }) {

    return <>
        <div
            onClick={props.onSelect}
            className={classNames(
                "border-2 border-black/10 rounded-lg p-6 flex flex-col gap-2 justify-between relative group hover:border-pnw-gold hover:-translate-y-0.5 transition-transform hover:shadow-md hover:cursor-pointer",
                { "border-pnw-gold shadow-lg -translate-y-0.5 transition-transform": props.selected })}>

            {props.showSelect && <div className="rounded-full border-2 border-black/10 p-0.5 w-5 h-5 absolute top-4 right-4">

                {props.selected && <div className="w-full h-full rounded-full bg-pnw-gold" />}

            </div>}

            <div className="flex flex-col gap-2">

                {props.icon && <div className="w-9 h-9 [&>*]:w-9 [&>*]:h-9">

                    {props.icon}

                </div>}

                <div className="flex gap-4 justify-between items-end">

                    <p className="font-semibold text-lg">{props.title}</p>

                    {props.titleRight && <p className="text-sm">{props.titleRight}</p>}

                </div>

                <p className="text font-light">{props.description}</p>

            </div>

            <br />

            <div className="flex flex-col gap-2 text-sm">

                <div className="flex flex-col gap-1">

                    {props.benefits &&
                        props.benefits.length > 0 &&
                        props.benefits.map((text, i) => (
                            <div key={`b-${i}`} className="flex items-center gap-2">
                                <FaCheck className="fill-pnw-gold shrink-0" />
                                {text.trim()}
                            </div>
                        ))
                    }

                    {props.cons &&
                        props.cons.length > 0 &&
                        props.cons.map((text, i) => (
                            <div key={`c-${i}`} className="flex items-center gap-2">
                                <FaTimes className="shrink-0" />
                                {text.trim()}
                            </div>
                        ))
                    }

                </div>

            </div>

            {/* Learn More URL */}
            {props.learnMoreURL && <>

                <a target="_blank" className="text-xs text-pnw-gold font-medium hover:underline flex items-center gap-1.5" href={props.learnMoreURL}>
                    {props.learnMoreText ?? "Learn More"}
                    <FaArrowRight />
                </a>

            </>}

        </div>

    </>
}

function DisplayManufacturingMethod({ method, selected, filaments, onClick }: { filaments: Filament[], method: ManufacturingMethod, selected: boolean, onClick: () => void }) {

    const startingPrice = filaments.filter(f => f.manufacturingMethod === method).sort((a, b) => a.costPerGramInCents - b.costPerGramInCents).at(0);

    return <>

        <Card
            showSelect={true}
            selected={selected}
            onSelect={onClick}
            titleRight={startingPrice && `From ${(startingPrice.costPerGramInCents / 100).toFixed(2)} / ${method.unit}`}
            icon={method.icon ? <IconByName iconWholeName={method.icon} /> : undefined}
            title={method.shortName}
            description={`${method.wholeName}, ${method.description}`}
            cons={method.cons ?? []}
            benefits={method.benefits ?? []} />

    </>

}

type UploadedModel = { file: File, fileName: string, name: string, extension: string, sizeInBytes: number, geometry?: ModelGeometry, geometryParseIssues?: string };

type ModelSelection = {

    usePreviousModels: boolean,
    uploadedModels: UploadedModel[],

};

function ModelDia({ uploadModel, onRemove, onSelect, selected }: { selected: boolean, uploadModel: UploadedModel, onRemove?: () => void; onSelect?: () => void; }) {

    const geometryIssues = uploadModel.geometryParseIssues || ((uploadModel.geometry?.issues && uploadModel.geometry?.issues.length > 0) ? uploadModel.geometry.issues.join(", ") : null);

    const availableActions = useMemo(() => {

        const availableActions: React.ComponentProps<typeof ContextActionMenu>["actions"] = [];

        if (onRemove) availableActions.push({ name: "Remove Model", icon: <FaTrash />, action: () => onRemove?.(), style: "warning" });

        return availableActions;

    }, [onRemove]);

    return <>

        <ContextActionMenu actions={availableActions}>

            <div
                onClick={onSelect}
                className={classNames("flex flex-none gap-4 items-center shadow-sm bg-gray-50 justify-between px-4 w-full border-2 border-black/5 rounded-lg group hover:border-pnw-gold transition-transform", { "hover:cursor-pointer": onSelect !== undefined })}>

                <div className="py-4 min-w-0 flex-1">

                    <p className="font-medium overflow-ellipsis whitespace-nowrap overflow-hidden">{uploadModel.name}</p>
                    <p className="text-xs font-normal mt-0.5 break-words">

                        {formatBytes(uploadModel.sizeInBytes, 0)}
                        <span className="uppercase"> {uploadModel.extension}</span>
                        {uploadModel.geometry && <> Size {uploadModel.geometry.dimensions.string}</>}

                        {geometryIssues && <span className="text-warning uppercase"> {geometryIssues}</span>}

                    </p>

                </div>

                <div className="flex-none">

                    <div className="flex basis-[4rem] gap-6 items-center">

                        {/* {onRemove && <FaRegTrashAlt className="w-4 h-4 opacity-20 button invisible group-hover:visible" onClick={onRemove} />} */}
                        {/* {onSelect && <FaRegSave className="w-4 h-4 opacity-20 button invisible group-hover:visible" onClick={onSelect} />} */}

                        <div className="w-[5rem] h-[4rem]">
                            {uploadModel.geometry?.threeGeometry
                                ? <ThreeModelViewer key={`${uploadModel.fileName}-model-viewer`} geometry={uploadModel.geometry.threeGeometry} moveable={false} style="" showPrompts={false} />
                                : geometryIssues
                                    ? <FaTriangleExclamation className="w-full h-full p-4 fill-warning" />
                                    : <RegularSpinnerSolid className="w-full h-full p-4 animate-spin fill-pnw-gold" />}

                        </div>

                    </div>
                </div>
            </div>

        </ContextActionMenu>


    </>
}

function Upload3DModels({ existingState, onNext, onCancel }: React.PropsWithChildren<{ existingState?: ModelSelection, onCancel?: () => void, onNext?: (selection: ModelSelection) => void }>) {

    const { register, watch } = useForm({ defaultValues: { "use-previous-models": existingState?.usePreviousModels ?? false } });

    const doUsePreviousModels = watch("use-previous-models");

    const invisibleFileInputRef = useRef<InvisibleFileInputHandle>(null);

    const [uploadedModels, setUploadModels] = useState<UploadedModel[]>(existingState?.uploadedModels ?? []);

    const anyModelParseFailed = uploadedModels.some(m => m.geometryParseIssues != null);
    const anyModelsProcessing = uploadedModels.some(m => m.geometry == null);

    const uploadSizeInBytes = useMemo(() => uploadedModels.map(m => m.sizeInBytes).reduce((p, v) => p + v, 0), [uploadedModels]);
    const uploadSizeIsUnderLimit = uploadSizeInBytes <= uploadLimitInBytes;

    const addModelCallback = useCallback((files: FileList) => {

        const newModels = uniqueBy(Array.from(files)
            .map(f => ({ file: f, fileName: f.name, name: cleanseFilename(f.name), extension: f.name.split(".").at(-1), sizeInBytes: f.size } as UploadedModel))
            .filter(mA => !uploadedModels.some(mB => isFileEqual(mA.file, mB.file))), e => e.name);

        newModels.forEach((model, i) => {
            sleep(i * 250) // Delay each model processing by 1/4 of a second.
                .then(() => parseUploadedModelGeometry(model))
                .then(geometry => setUploadModels(prev => prev.map(item => item === model ? { ...item, geometry } : item)))
                .catch(err => setUploadModels(prev => prev.map(item => item === model ? { ...item, geometryParseIssues: String(err) } : item)));
        });

        // Add new models after scheduling their parsing
        setUploadModels(prev => [...prev, ...newModels]);

    }, [uploadedModels]);

    const removeModelCallback = useCallback((model: UploadedModel) => {

        setUploadModels(prev => prev.filter(item => item !== model));

    }, []);

    return <>

        <Slide
            title={"Upload your 3D Files"}
            description={<>Upload the 3D models you would like to use and click to remove. Our printers handle everything from quick prototypes to polished final designs with reliable quality.</>}
            nextText="Choose Manufacturing Method"
            onNext={() => onNext?.({ usePreviousModels: doUsePreviousModels, uploadedModels: uploadedModels })}
            nextEnabled={uploadSizeIsUnderLimit && !anyModelsProcessing && (uploadedModels.length > 0 || doUsePreviousModels)}
            nextHelperText={
                !uploadSizeIsUnderLimit
                    ? `Upload size exceeds the Limit (${formatBytes(uploadLimitInBytes, 0)})`
                    : anyModelParseFailed
                        ? "Failed to parse one or more Geometries"
                        : anyModelsProcessing
                            ? "Processing Models"
                            : "Upload a model to Continue"}
            cancelText="Cancel"
            onCancel={onCancel}>

            <InvisibleFileInput ref={invisibleFileInputRef} accept=".stl" multiple onChange={addModelCallback} />

            <div className="hover:cursor-pointer" onClick={() => invisibleFileInputRef.current?.enter?.()}>

                <OutlinedInstructionPanel
                    title={"Select to Upload Files"}
                    icon={<FaCloudArrowUp />}
                    descriptions={[
                        `Supported Formats: STL, OBJ, 3MF (Max ${formatBytes(uploadLimitInBytes, 0)})`,
                        "Models must sized under 256x256x256 Millimeters"]} />

            </div>

            {/* Item List */}
            <div className="grid grid-cols-2 gap-4 w-full">

                {uploadedModels.map(model => <ModelDia selected={false} key={model.fileName} uploadModel={model} onRemove={() => removeModelCallback(model)} />)}

            </div>

            {/* <div className="flex gap-2 text-sm items-center justify-center w-fit ml-auto">

                <span className="text-nowrap">I'd like to use my previous Models</span>
                <input className="border-none outline-none mb-0" type="checkbox" {...register("use-previous-models")} />

            </div> */}

        </Slide>

    </>
}

function Slide({ title, icon, description, children, onCancel, onNext, nextText, nextHelperText, cancelText, nextEnabled, titleSide }: React.PropsWithChildren<{ title: string | React.ReactElement, icon?: React.ReactElement, titleSide?: React.ReactElement, description: string | React.ReactElement, onCancel?: () => void, onNext?: () => void, nextHelperText?: string, nextText?: string, cancelText?: string, nextEnabled: boolean }>) {

    return <>

        <div className="flex gap-9 justify-between items-start">

            <div>

                <Snibbit icon={icon!} text={title} className="text-2xl mb-2 font-bold" />
                <p className="text-base">{description}</p>

            </div>

            {titleSide}

        </div>

        {children}

        {/* Controls */}
        <div className="flex justify-between items-center w-full">

            {(onCancel) ? <button
                className={classNames("flex text-sm gap-2 mb-0 pl-0 items-center bg-transparent rounded-lg text-black hover:text-black hover:bg-transparent justify-center w-fit")}
                onClick={() => onCancel?.()}>
                {cancelText ?? "Go Back"}
            </button> : <div></div>}


            <div className="flex gap-6 items-center">

                {nextHelperText && !nextEnabled && <p className="font-light text-sm">{nextHelperText}</p>}

                {(onNext) ? <button disabled={!nextEnabled}
                    className="flex text-sm gap-2 mb-0 items-center shadow-sm justify-center w-fit rounded-lg"
                    onClick={() => onNext?.()}>
                    {nextText ?? "Next Step"}
                    <FaArrowRight />
                </button> : <div />}

            </div>

        </div>

    </>
}

function Snibbit({ icon, text, children, className }: React.PropsWithChildren<{ icon?: React.ReactElement, text: string | React.ReactElement, className?: string }>) {

    return <>

        <p className={classNames(className, "font-medium flex gap-2 items-center [&>*]:fill-pnw-gold", className)}>
            {icon && icon}
            {text}
        </p>

        {children}

    </>
}

function Surface({ children, gap = 3 }: React.PropsWithChildren<{ gap?: number }>) {
    return <>

        <div className="bg-white rounded-lg p-8 flex flex-col drop-shadow-sm" style={{ gap: `${4 * gap}px` }}>

            {children}

        </div>

    </>
}

function OutlinedInstructionPanel({ title, descriptions, icon }: { title: string, descriptions: string[], icon: React.ReactElement }) {
    return <>

        <div
            className="border-3 w-full h-full border-dashed border-black/10 rounded-lg py-0.50 hover:bg-pnw-gold-light flex justify-center flex-col gap-2 py-6 items-center text-sm">

            <div className="mx-auto [&>*]:fill-pnw-gold h-14 w-14 [&>*]:w-full [&>*]:h-full">

                {icon}

            </div>

            <p className="text-lg font-medium">{title}</p>

            {descriptions.map(d => <p key={d} className="text-sm">{d}</p>)}

        </div>

    </>
}

function cleanseFilename(filename: string): string {

    // Remove file extension
    let name = filename.replace(/\.[^.]*$/, '');

    // Remove version numbers in parentheses: (1), (2), etc.
    name = name.replace(/\s*\(\d+\)\s*$/, '');

    // Remove " - Part" followed by a number
    name = name.replace(/\s*-\s*Part\s+\d+\s*$/i, '');

    name = name.trim();

    return name;
}

type ModelGeometry = {

    threeGeometry: BufferGeometry,
    dimensions: { width: number, length: number, height: number, string: string }
    issues?: string[]

};

function parseUploadedModelGeometry(model: UploadedModel) {

    return new Promise<ModelGeometry>(async (resolve, reject) => {

        try {
            const fileArrayBuffer = await model.file.arrayBuffer();

            const loader = new STLLoader();

            const geometry = loader.parse(fileArrayBuffer);

            geometry.computeVertexNormals();

            geometry.computeBoundingBox();

            const dimensionVector = new Vector3();

            geometry.boundingBox!.getSize(dimensionVector);

            let modelIssues: string[] = [];

            const tooLarge = dimensionVector.x >= 256 || dimensionVector.y >= 256 || dimensionVector.z >= 256;

            if (tooLarge) modelIssues.push("Dimensions exceed limits, split model!");

            resolve({

                threeGeometry: geometry,
                dimensions: {
                    width: dimensionVector.x,
                    length: dimensionVector.y,
                    height: dimensionVector.z,
                    string: `${dimensionVector.x.toFixed(1)} x ${dimensionVector.y.toFixed(1)} x ${dimensionVector.z.toFixed(1)}`
                },
                issues: modelIssues

            });
        }
        catch (error) {
            reject(error);
        }

    });

}

const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function isFileEqual(aFile: File, bFile: File) {
    // This appears to be the best method I've found so far.
    return aFile.name === bFile.name
        && aFile.size === bFile.size
        && aFile.lastModified === bFile.lastModified;
}