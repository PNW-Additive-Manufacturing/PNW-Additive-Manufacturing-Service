"use client"

import { useState } from 'react';
import { RegularDownload } from 'lineicons-react';

export function InlineFile({ filename, className }: { filename: string; className?: string; }) {
    var [isHovered, setIsHovered] = useState<boolean>();

    // TODO: Include download link when clicked on.
    return <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${className}`}>
        {filename}
        <RegularDownload className={`inline p ml-2 h-max aspect-square transition-colors ${isHovered ? 'fill-blue-400' : 'fill-transparent'} hover:cursor-pointer`}></RegularDownload>
    </span>;
}
