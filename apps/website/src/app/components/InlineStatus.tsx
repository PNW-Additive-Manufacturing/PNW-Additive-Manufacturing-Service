'use client'

export default function InlineStatus({status, color}: {status: string, color: string})
{
    return <span className={`px-2 py-1 whitespace-nowrap rounded-md text-base ${color}`} style={{backgroundColor: color}}>
        {status}
    </span>
}