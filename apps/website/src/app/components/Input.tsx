import { CSSProperties, ChangeEventHandler, HTMLInputTypeAttribute, use, useEffect, useState } from "react"

export function Input({ label, type, id, name, placeholder, defaultValue, onChange, value }: { label: string, type: HTMLInputTypeAttribute, id: string, name?: string, placeholder: string, defaultValue?: string, onChange?: ChangeEventHandler<HTMLInputElement>, value?: string }): JSX.Element {
    return (
        <div className="font-semibold text-sm w-full">
            <p className="br-2 mb-2">{label}</p>
            <input className="w-full" id={id} name={name} type={type} size={50} placeholder={placeholder} defaultValue={defaultValue} onChange={onChange} value={value}></input>
        </div>
    )
}

export function InputBig({ label, id, name, placeholder, className, style }: { label?: string, id: string, name?: string, placeholder: string, className?: string, style?: CSSProperties }): JSX.Element {
    return (
        <div className={`font-semibold ${className == null ? '' : className}`} style={style}>
            {label ? <p className="uppercase br-2">{label}</p> : <></>}
            <textarea className="box-border resize-y w-full mb-0" id={id} name={name} rows={4} placeholder={placeholder}></textarea>
        </div>
    )
}