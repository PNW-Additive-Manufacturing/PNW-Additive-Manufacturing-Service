"use client";
import { useFormStatus } from "react-dom";
import { FaSpinner } from "react-icons/fa";

export default function FormLoadingSpinner({ className }: { className?: string; }) {
	
	const { pending } = useFormStatus();

	return pending ? (
		<FaSpinner
			className={`inline-block h-auto w-auto animate-spin fill-white ${className}`}
		/>
	) : (
		<></>
	);
}
