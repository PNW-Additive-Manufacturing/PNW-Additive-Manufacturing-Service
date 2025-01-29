import classNames from "classnames";
import { RegularCheckmark } from "lineicons-react";
import { FaCheck } from "react-icons/fa";

export interface TimelineOptionData {
	title: string;
	description?: JSX.Element;
	disabled: boolean;
}

export default function Timeline({
	options
}: {
	options: TimelineOptionData[];
}) {
	const firstDisabledOptionIndex = options.findIndex(
		(option) => option.disabled
	);

	if (firstDisabledOptionIndex >= 0)
		options = options.slice(0, firstDisabledOptionIndex + 1);

	return (
		<>
			{options.map((option, index) => {
				const isLast = index == options.length - 1;

				return (
					<div className={classNames("flex gap-4")}>
						<div className="flex flex-col">
							<div
								className={`border-pnw-gold ${!option.disabled && "bg-pnw-gold"} w-6 h-6 rounded-full flex justify-center items-center`}
								style={{ borderWidth: "3px" }}>
								<FaCheck className="w-full h-full fill-background" style={{ padding: "2.75px" }} />
							</div>
							{!isLast && (
								<div className="flex-1 mx-auto bg-pnw-gold min-h-8" style={{ width: "5px" }} />
							)}
						</div>
						<div className={classNames("pt-0.5", { "mb-2": !isLast })}>
							<p className={classNames("mt-0 text-inherit mb-0.5", { "text-pnw-gold font-semibold": index == firstDisabledOptionIndex - 1 || (isLast && !option.disabled) })} style={{ fontSize: "15px" }}>{option.title}</p>
							{option.description && !option.disabled && (
								<p className="text-sm font-light text-inherit">{option.description}</p>
							)}
						</div>
					</div >
				);
			})}
		</>
	);
}
