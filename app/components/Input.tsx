import {
	CSSProperties,
	ChangeEventHandler,
	HTMLInputTypeAttribute,
	use,
	useEffect,
	useState
} from "react";

export function Input({
	label,
	type,
	id,
	name,
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
	name?: string;
	required?: boolean;
	placeholder?: string;
	defaultValue?: string;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	value?: string;
	children?: any;
}): JSX.Element {
	required = required ?? false;

	return (
		<div className="w-full">
			<label className="text-gray-600">{label}</label>
			<input
				required={required}
				className="w-full"
				id={id}
				name={name}
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
}): JSX.Element {
	required = required ?? false;

	return (
		<div className="flex items-center w-fit gap-2">
			<label className="mb-0 text-wrap">{label}</label>
			<input
				required={required}
				className="outline-none border-none w-5 h-5 mb-0"
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
	style
}: {
	label?: string;
	id: string;
	name?: string;
	placeholder: string;
	className?: string;
	style?: CSSProperties;
}): JSX.Element {
	return (
		<div
			className={`font-semibold ${className == null ? "" : className}`}
			style={style}>
			{label && <p className="uppercase br-2">{label}</p>}
			<textarea
				className="box-border resize-y w-full mb-0"
				id={id}
				name={name}
				rows={4}
				placeholder={placeholder}></textarea>
		</div>
	);
}
