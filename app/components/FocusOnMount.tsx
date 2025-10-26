"use client"

import { useEffect, useRef, useState } from "react";

export default function FocusOnMount({
	children
}: {
	children: any;
}): React.ReactElement {
	const containerRef = useRef<HTMLElement>(undefined);
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
