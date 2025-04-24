"use server";

import { RegularDiamondAlt, RegularDiamondShape } from "lineicons-react";
import HorizontalWrap from "../components/HorizontalWrap";
import { Swatch, SwatchColorBlock } from "../components/Swatch";
import FilamentBlock from "../experiments/FilamentBlock";
import FilamentServe from "../Types/Filament/FilamentServe";
import Image from "next/image";
import Filament from "../Types/Filament/Filament";
import DropdownSection from "../components/DropdownSection";

const materialMapping: Record<string, { coverUrl?: string, hint?: string }> = {
    "17-4PH Stainless Steel":
    {
        coverUrl: "/assets/filaments/17-4PH Stainless Steel.png",
        hint: "Industrial Strength"
    },
    "PLA":
    {
        hint: "Popular for Prototyping",
    },
    "ABS":
    {
        coverUrl: "/assets/filaments/blocks.jpg",
        hint: "Heat and impact Resistant"
    },
    "PAHT-CF":
    {
        hint: "Carbon Fiber reinforced Nylon"
    },
    "TPU":
    {
        hint: "Flexible"
    }
}

const materialWizardOptions: Record<string, string> = {
    "Industrial Strength": "metal-fff#17-4PH Stainless Steel",
    "Impact Resistant": "fdm#abs",
    "Plastic Mounting": "fdm#pla"
};

function MaterialWizard({ filaments }: { filaments: Filament[] }) {
    return <>
        <DropdownSection name={"Need help choosing a process or material? Use the Material Wizard."} className="pl-0">
            <div className="bg-white out p-6">
                <div className="flex justify-between">
                    <div>
                        <label>What strength are you looking for?</label>
                        <select title="Strength" className="w-fit">
                            {Object.entries(materialWizardOptions).map(o => <option value={o[1]}>{o[0]}</option>)}
                        </select>
                    </div>
                    <span>We recommend using <span className="text-pnw-gold">PLA</span></span>
                </div>
            </div>

        </DropdownSection>

    </>
}

export default async function Materials() {

    const filaments = (await FilamentServe.queryAll()).sort((a, b) => a.material.localeCompare(b.material)).filter(f => f.inStock);
    // We are filtering out to create a unique list of technologies we currently support.
    const uniqueTechnology = filaments.filter((f, index) => filaments.findIndex(b => b.technology == f.technology) == index);

    return <>
        <HorizontalWrap>
            <h1 className="w-fit text-2xl font-normal mb-2"><RegularDiamondAlt className="inline mb-1 p-0.5 fill-pnw-gold" /> Process and Materials</h1>
            <p className="mb-2">
                Choosing the correct manufacturing process and material is essential to ensure the part meets its functional, aesthetic, and durability requirements.
            </p>

            <div className="mb-6">
                {/* <MaterialWizard filaments={filaments} /> */}
            </div>
        </HorizontalWrap>
        <div className="bg-white">
            <HorizontalWrap>
                <div className="py-8">
                    {uniqueTechnology.map(t => {
                        const uniqueMaterials = filaments.filter((f, index) => filaments.findIndex(b => b.material == f.material) == index && f.technology == t.technology);

                        return <div>
                            <label className="text-xl">{t.technology} Manufacturing</label>
                            <hr />
                            <div className="flex gap-6 mb-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {uniqueMaterials.map((m, index) => {
                                        const filamentsOfMaterial = filaments.filter(f => f.material == m.material && f.inStock);

                                        return <div className="flex max-lg:flex-col gap-6 ">
                                            {materialMapping[m.material]?.coverUrl != undefined && <Image className="max-lg:w-full w-40 h-auto rounded-md object-cover shadow-md" src={materialMapping[t.material]?.coverUrl as string} alt={t.technology} width={480} height={480} />}

                                            <div className="flex flex-col justify-between">
                                                <div>
                                                    <h3 id={`${m.technology.toLowerCase()}-${m.material.replaceAll(" ", "-").toLowerCase()}`} className="text-xl target:bg-yellow-100 target:px-2 w-fit">
                                                        {m.material}
                                                        {materialMapping[m.material]?.hint != undefined && <span className="text-pnw-gold font-semibold ml-2">| {materialMapping[m.material]?.hint}</span>}
                                                    </h3>
                                                    <p className="mb-4 mt-1" style={{ maxWidth: "900px" }}>{m.details}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Lead Time: {m.leadTimeInDays}-{m.leadTimeInDays + 2} Days.</p>
                                                    <p className="text-gray-600">Starting at ${(Math.min(...filamentsOfMaterial.map(f => f.costPerGramInCents)) / 100)} USD per Gram.</p>
                                                    <div className={materialMapping[m.material]?.coverUrl ? "" : `mt-2 pb-2.5 rounded-md`}>
                                                        <label className="mt-1">Colors</label>
                                                        <div className="flex gap-4">
                                                            {filamentsOfMaterial.map(f => <SwatchColorBlock swatch={f.color} />)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            </HorizontalWrap>
        </div>
    </>;

}
