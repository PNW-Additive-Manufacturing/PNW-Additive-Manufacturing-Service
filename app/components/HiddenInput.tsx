import {
	DetailedHTMLProps,
	InputHTMLAttributes,
	ReactNode,
	useRef
} from "react";

export default function HiddenInput(
	attributes: Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange" | "className" | "style">
		& { onChange: (file: File) => void; children: ReactNode; }) {

	const inputRef = useRef<HTMLInputElement | undefined>(undefined);

	return (
		<div className={`inline hover:cursor-pointer`}>
			<input
				{...{
					...attributes,
					ref: inputRef as any,
					children: undefined,
					className: "hidden",

					onChange: (ev) => attributes.onChange(ev.target.files?.item(0)!)
				}}
			/>
			<div
				onClick={(ev) => {
					ev.preventDefault();
					(inputRef.current?.valueOf() as HTMLInputElement).click();
				}}>
				{attributes.children}
			</div>
		</div>
	);
}
