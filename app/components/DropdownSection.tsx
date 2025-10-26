"use client";

import classNames from "classnames";
import { ReactNode, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function DropdownSection({
	name,
	icon,
	hidden,
	collapsible,
	children,
	className,
	nameClassname
}: {
	name: string;
	nameClassname?: string;
	icon?: React.ReactElement;
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
				className={classNames("hover:text-black flex items-center justify-between gap-2 p-0 w-full hover:cursor-pointer fill-gray-400 hover:fill-cool-black mb-3", className)}
				onClick={() => setHidden(!isHidden)}>
				<div className={classNames("flex items-center gap-1.5 flex-wrap", nameClassname)}>
					{icon}
					{name}
				</div>
				<FaChevronDown
					className={`w-5 h-5 fill-inherit ${isHidden ? "rotate-180" : ""
						} hover:cursor-pointer transition-all`}
					style={{}}
				/>
			</div>
			<div className={isHidden ? "hidden" : "mb-3"}>{children}</div>
		</>
	);
}
