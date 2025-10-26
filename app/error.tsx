"use client"

import ErrorPrompt from "./components/ErrorPrompt";

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {

	return (
		<div>
			<ErrorPrompt
				code={error.name}
				details={`An exception occurred on your end! Check your console for details or refresh.`} />
		</div>
	);
}
