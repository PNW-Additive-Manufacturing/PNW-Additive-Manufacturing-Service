import {
	ChangeEventHandler,
	DetailedHTMLProps,
	InputHTMLAttributes,
	LegacyRef,
	MutableRefObject,
	ReactNode,
	useRef
} from "react";

export default function HiddenInput(
	attributes: Omit<
		DetailedHTMLProps<
			InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		"onChange"
	> & {
		onChange: (file: File) => void;
		children: ReactNode;
	}
) {
	var inputRef = useRef<LegacyRef<HTMLInputElement> | undefined>();

	return (
		<div className={`inline ${attributes.className} hover:cursor-pointer`}>
			<input
				{...{
					...attributes,
					children: undefined,
					ref: inputRef as any,
					className: "hidden",
					onChange: (ev) => {
						ev.preventDefault();
						attributes.onChange(ev.target.files?.item(0)!);
						ev.currentTarget.value = "";
					}
				}}
			/>
			<div
				className="inline"
				onClick={(ev) => {
					ev.preventDefault();
					(inputRef.current?.valueOf() as HTMLInputElement).click();
				}}>
				{attributes.children}
			</div>
		</div>
	);
}
