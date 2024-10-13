import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function ControlButton(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>)
{
    return <button {...props} className={`${props.className} px-3 py-2 ${props.className} text-sm font-normal w-fit mb-0`}>{props.children}</button>
}