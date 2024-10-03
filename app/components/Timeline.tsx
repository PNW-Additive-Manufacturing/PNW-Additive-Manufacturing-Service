import { RegularCheckmark } from "lineicons-react";

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
					<div className={`flex gap-4`}>
						<div className="flex flex-col">
							<div
								className={`border-4 border-pnw-gold ${
									!option.disabled && "bg-pnw-gold"
								} w-7 h-7 rounded-full flex justify-center items-center`}>
								<RegularCheckmark className="w-full h-full p-1 fill-white"></RegularCheckmark>
							</div>
							{!isLast && (
								<div className="w-1 flex-1 mx-auto bg-pnw-gold min-h-6" />
							)}
						</div>
						<div className={`pt-0.5 ${!isLast ? "mb-2" : ""}`}>
							<p className="text-base">{option.title}</p>
							{option.description && !option.disabled && (
								<p className="text-sm">{option.description}</p>
							)}
						</div>
					</div>
				);
			})}
		</>
	);
}
