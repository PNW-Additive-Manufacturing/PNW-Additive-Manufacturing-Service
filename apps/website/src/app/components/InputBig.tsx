export function InputBig({ label, id, placeholder }: { label: string, id: string, placeholder: string }): JSX.Element {
    return (
        <div className="font-semibold">
            <p className="uppercase br-2">{label}</p>
            <textarea className="" id={id} rows={4} cols={100} placeholder={placeholder}></textarea>
        </div>
    )
}