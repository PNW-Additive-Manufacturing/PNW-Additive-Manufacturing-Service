import { useEffect, useRef, useState } from "react";

export default function FocusOnMount({
	children
}: {
	children: any;
}): JSX.Element {
	const containerRef = useRef<HTMLElement>();
	const [hasScrolled, setScrolled] = useState(false);

	useEffect(() => {
		if (containerRef.current != undefined && !hasScrolled) {
			containerRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
				inline: "start"
			});
			setScrolled(true);
		}
	});
	return <div ref={containerRef as any}>{children}</div>;
}
