"use client"

export function ProgressBar({ color, percentage, backgroundColor, className }: { color: string; percentage: number; backgroundColor?: string; className?: string; }) {
    return <div className={'inline-block rounded-md h-3 w-24 bg-white ' + className} style={{ backgroundColor: backgroundColor ?? "white" }}>
        <div className='h-full overflow-x-hidden' style={{ backgroundColor: color, width: `${percentage}%`, borderRadius: "inherit" }}></div>
    </div>;
}
