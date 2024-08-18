"use client";

import { RegularSpinnerSolid } from "lineicons-react";
import { useFormStatus } from "react-dom";

export default function FormLoadingSpinner({
	className
}: {
	className?: string;
}): JSX.Element {
	const { pending } = useFormStatus();

	return pending ? (
		<RegularSpinnerSolid
			className={`inline-block h-auto w-auto animate-spin ${className}`}></RegularSpinnerSolid>
	) : (
		<></>
	);
}
