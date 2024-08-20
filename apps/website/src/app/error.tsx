"use client";

import { useEffect } from "react";
import ErrorPrompt from "./components/ErrorPrompt";

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
		// Log the error to an error reporting service
	}, [error]);

	return (
		<div>
			<ErrorPrompt
				code={error.name}
				details={
					"An exception occurred on your end! Check your console for details or refresh."
				}></ErrorPrompt>
		</div>
	);
}
