"use client"

import { RegularDownload } from 'lineicons-react';

export function InlineFile({ filename, filepath, className }: { filename: string, filepath: string; className?: string; }) {
    return <a download={true} href={`/api/download/?file=${filepath}`}><span className={`${className}`}>
        {filename}
        <RegularDownload className={`inline p ml-2 h-max aspect-square transition-colors fill-slate-300 hover:fill-blue-400 hover:cursor-pointer`}></RegularDownload>
    </span></a>;
}
