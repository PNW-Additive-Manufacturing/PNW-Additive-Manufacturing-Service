"use client";
import { FaSpinner } from "react-icons/fa";
import { useFormStatus } from "react-dom";

export default function FormLoadingSpinner({
	className
}: {
	className?: string;
}): JSX.Element {
	const { pending } = useFormStatus();

	return pending ? (
		<FaSpinner
			className={`inline-block h-auto w-auto animate-spin fill-white ${className}`}
		/>
	) : (
		<></>
	);
}
