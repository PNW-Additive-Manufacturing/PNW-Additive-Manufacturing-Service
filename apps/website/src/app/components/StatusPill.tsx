import { HTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export default function StatusPill({
	statusColor,
	context,
	className
}: {
	statusColor: string;
	context: string;
	className?: string;
}) {
	className = className ?? "";

	return (
		<div className={`inline-block ${className} text-nowrap`}>
			<div
				className={`bg-gray-50 w-fit rounded-lg p-1.5 flex font-normal select-none uppercase`}>
				<div
					className={`hidden lg:block rounded-full h-5 mr-2 aspect-square bg-${statusColor}`}></div>
				<span className="my-auto mr-1 text-sm">{context}</span>
			</div>
		</div>
	);
}

export function SelectorStatusPill({
	statusColor,
	className,
	children,
	register,
	defaultValue
}: {
	statusColor: string;
	className?: string;
	children: any;
	register?: UseFormRegisterReturn;
	defaultValue?: string | number | readonly string[];
}) {
	className = className ?? "";

	return (
		<div
			className={`${className} bg-gray-50 w-fit rounded-lg p-1.5 flex font-normal select-none uppercase text-nowrap`}>
			<div
				className={`rounded-full h-5 mr-2 aspect-square bg-${statusColor}`}></div>
			<select
				id="status"
				name="status"
				defaultValue={defaultValue}
				className="my-auto mr-1 text-sm p-0 uppercase outline-none"
				{...register}>
				{children}
			</select>
		</div>
	);
}
