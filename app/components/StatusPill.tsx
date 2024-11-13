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
				className={`bg-gray-50 w-fit rounded-lg p-1.5 flex items-center font-normal select-none uppercase`}>
				<div
					className={`rounded-full h-5 mr-2 aspect-square`}
					style={{ backgroundColor: statusColor }} />
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
			className={`${className} bg-background w-fit text-xs rounded-md p-2 flex select-none uppercase text-nowrap`}>
			<div
				className={`rounded-full h-3.5 mr-2 aspect-square`}
				style={{ backgroundColor: statusColor }} />
			<select
				id="status"
				name="status"
				defaultValue={defaultValue}
				className="my-auto mr-1 p-0 uppercase outline-none"
				{...register}>
				{children}
			</select>
		</div>
	);
}
