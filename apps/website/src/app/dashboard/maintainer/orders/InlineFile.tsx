"use client"

import { useState } from 'react';
import { RegularDownload } from 'lineicons-react';

export function InlineFile({ filename, className }: { filename: string; className?: string; }) {

    // TODO: Include download link when clicked on.
    return <span className={`${className}`}>
        {filename}
        <RegularDownload className={`inline p ml-2 h-max aspect-square transition-colors fill-slate-300 hover:fill-blue-400 hover:cursor-pointer`}></RegularDownload>
    </span>;
}
