import {
    CSSProperties,
    ChangeEventHandler,
    HTMLInputTypeAttribute
} from "react";
import { Label } from "./Inputs";

export function Input({
	label,
	type,
	id,
	placeholder,
	defaultValue,
	onChange,
	value,
	required,
	children
}: {
	label: string;
	type: HTMLInputTypeAttribute;
	id: string;
	required?: boolean;
	placeholder?: string;
	defaultValue?: string;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	value?: string;
	children?: any;
}): React.ReactElement {
	required = required ?? false;

	return (
		<div className="w-full">
			<Label content={label}></Label>
			<input
				required={required}
				className="lg:text-sm w-full"
				id={id}
				name={id}
				type={type}
				size={50}
				placeholder={placeholder}
				defaultValue={defaultValue}
				onChange={onChange}
				value={value}>
				{children}
			</input>
		</div>
	);
}

export function InputCheckbox({
	label,
	id,
	name,
	defaultChecked,
	onChange,
	required,
	children
}: {
	label: string;
	id: string;
	name?: string;
	required?: boolean;
	defaultChecked?: boolean;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	children?: any;
}): React.ReactElement {
	required = required ?? false;

	return (
		<div className="flex items-center w-fit gap-2">
			<label className="mb-0 text-nowrap">{label}</label>
			<input
				required={required}
				className="lg:text-sm outline-none border-none w-5 h-5 mb-0"
				id={id}
				name={name}
				type="checkbox"
				size={50}
				defaultChecked={defaultChecked}
				onChange={onChange}>
				{children}
			</input>
		</div>
	);
}

export function InputBig({
	label,
	id,
	name,
	placeholder,
	className,
	style,
	required,
	max
}: {
	label?: string;
	id: string;
	name?: string;
	placeholder: string;
	className?: string;
	style?: CSSProperties;
	required?: boolean;
	max?: number;
}): React.ReactElement {
	required = required ?? false;
	label = label ?? "";

	return (
		<div
			className={`font-semibold ${className == null ? "" : className}`}
			style={style}>
			<Label content={label}></Label>
			<textarea
				required={required}
				className="lg:text-sm box-border resize-y w-full"
				id={id}
				name={name}
				rows={5}
				maxLength={max}
				placeholder={placeholder}>
			</textarea>
		</div>
	);
}
