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
	className,
	headerBackground,
	headerText,
	toolbar
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
				className="flex justify-between gap-2 w-full p-2 hover:cursor-pointer fill-gray-400 hover:fill-cool-black"
				onClick={() => setHidden(!isHidden)}>
				<RegularChevronDown
					className={`w-6 h-6 fill-inherit ${
						isHidden ? "rotate-180" : ""
					} hover:cursor-pointer transition-all`}
				/>
				<div>
					{name}
					{icon}
				</div>
			</div>
			{/* {isHidden ? <></> : <FocusOnMount>{children}</FocusOnMount>} */}
			{isHidden ? <></> : children}
		</>
	);

	// return (
	// 	<div
	// 		className={
	// 			"w-full outline-dashed outline-gray-200 outline-1 " +
	// 				className ?? ""
	// 		}>
	// 		<div
	// 			className={`p-3 ${headerBackground ?? "bg-cool-black"} ${headerText ?? "text-white"}`}
	// 			onClick={() => {
	// 				if (collapsible!) setHidden(!isHidden);
	// 			}}>
	// 			<span className={`align-middle w-fit`}>
	// 				{icon == null ? <></> : icon}
	// 				<span className="font-semibold tracking-wide uppercase">
	// 					{name}
	// 				</span>
	// 				<span className="ml-4">
	// 					{(toolbar == null ? <></> : toolbar) as ReactNode}
	// 				</span>
	// 			</span>
	// 			<div className="float-right">
	// 				{collapsible ? (
	// 					<RegularChevronDown
	// 						className={`w-6 h-6 fill-gray-400 ${isHidden ? "rotate-180 hover:rotate-0" : "hover:rotate-180"} hover:cursor-pointer transition-transform`}></RegularChevronDown>
	// 				) : (
	// 					<></>
	// 				)}
	// 			</div>
	// 		</div>

	// 		<div className={isHidden ? "hidden" : "block"}>{children}</div>
	// 	</div>
	// );
}
