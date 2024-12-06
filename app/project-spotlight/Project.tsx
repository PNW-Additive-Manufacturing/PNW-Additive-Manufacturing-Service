import Image from "next/image";
import { useState } from "react";

export function Project({ title, author, description, imageSrc }: { title: string; author: string; description: string; imageSrc?: string; }) {
    const [show, setShow] = useState(true);

    return <div className="bg-gray-50 out shadow-sm rounded-md">

        {imageSrc && <Image className="bg-background shadow-sm rounded-b-none rounded-t-sm" style={{ aspectRatio: "2/1" }} src={imageSrc} alt={"Image"} width={720} height={720}></Image>}

        <div className="p-5">
            <h2 className="font-medium text-lg">{title}</h2>
            <p className="text-sm italic mb-3">{author}</p>
            {show ? <p className="text-sm">{description}</p> : <div className="text-sm">

                <span>{description.substring(0, Math.min(100, description.length))}</span>
                {description.length > 100 && <span className="text-pnw-gold opacity-70 hover:cursor-pointer hover:opacity-100" onClick={() => setShow(true)}> (Expand)</span>}

            </div>}
        </div>

    </div>;
}
