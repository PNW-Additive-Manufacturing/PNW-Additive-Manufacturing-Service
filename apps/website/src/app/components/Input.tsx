import { ChangeEventHandler, HTMLInputTypeAttribute, use, useEffect, useState } from "react"

export function Input({ label, type, id, name, placeholder }: { label: string, type: HTMLInputTypeAttribute, id: string, name?: string, placeholder: string }): JSX.Element {
    return (
        <div className="font-semibold w-full p-2">
            <p className="br-2 mb-2">{label}</p>
            <input className="w-full" id={id} name={name} type={type} size={50} placeholder={placeholder}></input>
        </div>
    )
}

export function InputBig({ label, id, name, placeholder, className }: { label?: string, id: string, name?: string, placeholder: string, className?: string }): JSX.Element {
    return (
        <div className={`font-semibold ${className == null ? '' : className}`}>
            {label ? <p className="uppercase br-2">{label}</p> : <></>}
            <textarea className="box-border resize-y w-full" id={id} name={name} rows={4} placeholder={placeholder}></textarea>
        </div>
    )
}