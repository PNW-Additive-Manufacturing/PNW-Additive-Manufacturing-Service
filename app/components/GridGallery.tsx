"use client";
import Image from "next/image";

export function GridGallery({ elements, maxCount }: { elements: React.ReactElement[], maxCount?: number }) {

    maxCount = maxCount ?? 4;

    let columns = 2;
    let rows = 2;
    const elementCount = Math.min(elements.length, maxCount);

    if (elementCount === 1) {
        columns = 1;
        rows = 1;
    }
    else if (elementCount === 2) {
        columns = 1;
        rows = 1;
    }
    else if (elementCount === 3) {
        // return <div className={`grid grid-cols-1 grid-rows-2 gap-2 bg-white`}>
        // 	<div className="bg-purple-400 w-12 h-12"></div>
        // 	<div className="bg-yellow-400 w-12 h-12"></div>
        // 	<div className="bg-orange-300 w-12 h-12"></div>
        // </div>
        columns = 2;
        rows = 2;
    }
    else if (elementCount >= 4) {
        columns = 2;
        rows = 2;
    }

    return <>

        <div className={`w-full h-full grid grid-cols-${columns} grid-rows-${rows}`}>

            {/* <div className="bg-purple-400 w-12 h-12"></div>
        <div className="bg-yellow-400 w-12 h-12"></div>
        <div className="bg-orange-300 w-12 h-12"></div>
        <div className="bg-green-300 w-12 h-12"></div> */}

            {/* {imageSources.map(s => <Image className="mix-blend-multiply" key={s} src={s} alt={s} width={512} height={512} />)} */}

            {elements.slice(0, elementCount).map(e => <div key={e.key} className="mix-blend-multiply overflow-hidden">{e}</div>)}

        </div>

    </>;
}
