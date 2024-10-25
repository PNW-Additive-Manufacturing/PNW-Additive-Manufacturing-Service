"use client";

import { RegularChevronDown } from "lineicons-react";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import FocusOnMount from "./FocusOnMount";

export default function DropdownSection({
	name,
	icon,
	hidden,
	collapsible,
	children,
	className
}: {
	name: string;
	icon?: JSX.Element;
	hidden?: boolean;
	collapsible?: boolean;
	className?: string;
	headerBackground?: string;
	headerText?: string;
	children?: any;
	toolbar?: ReactNode;
}) {
	collapsible = collapsible ?? true;

	var [isHidden, setHidden] = useState<boolean>(hidden ?? false);

	return (
		<>
			<div
				className={`flex justify-between gap-2 w-full p-2 hover:cursor-pointer fill-gray-400 hover:fill-cool-black ${className}`}
				onClick={() => setHidden(!isHidden)}>
				<div>
					{name}
					{icon}
				</div>
				<RegularChevronDown
					className={`w-6 h-6 p-0.5 fill-inherit ${isHidden ? "rotate-180" : ""
						} hover:cursor-pointer transition-all`}
				/>
			</div>
			<div className={isHidden ? "hidden" : ""}>{children}</div>
		</>
	);
}
