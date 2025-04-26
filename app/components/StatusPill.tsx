import { useLayoutEffect, useRef } from "react";
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
		<div
			className={`${className} w-fit rounded-md flex select-none text-nowrap capitalize`}>
			<div className={`rounded-full my-auto h-3 w-3 mr-2`} style={{ backgroundColor: statusColor }} />
			<span className="my-auto mr-1">{context}</span>
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

	const statusCircleRef = useRef<HTMLElement>();

	useLayoutEffect(() => {

		if (statusCircleRef.current?.clientHeight) {
			const size = statusCircleRef.current.clientHeight! - 2;

			statusCircleRef.current.style.width = `${size}px`;
			statusCircleRef.current.style.height = `${size}px`;
			statusCircleRef.current.style.marginTop = "auto";
			statusCircleRef.current.style.marginBottom = "auto";
		}

	}, [statusCircleRef]);

	return (
		<div
			className={`${className} w-fit rounded-md flex select-none text-nowrap`}>
			<div
				ref={statusCircleRef as any}
				className={`inline rounded-full mr-2 aspect-square`}
				style={{ backgroundColor: statusColor }} />
			<select
				id="status"
				name="status"
				defaultValue={defaultValue}
				className="my-auto w-fit p-0 outline-none bg-transparent"
				{...register}>
				{children}
			</select>
		</div>
	);
}
