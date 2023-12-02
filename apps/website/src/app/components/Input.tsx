import { ChangeEventHandler, HTMLInputTypeAttribute, use, useEffect, useState } from "react"

export function Input({ label, type, id, placeholder }: { label: string, type: HTMLInputTypeAttribute, id: string, placeholder: string }): JSX.Element {
    return (
        <div className="font-semibold">
            <p className="uppercase br-2">{label}</p>
            <input className="" id={id} type={type} size={50} placeholder={placeholder}></input>
        </div>
    )
}