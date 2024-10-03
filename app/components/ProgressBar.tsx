"use client";

export function ProgressBar({
	color,
	percentage,
	backgroundColor,
	className,
}: {
	color: string;
	percentage: number;
	backgroundColor?: string;
	className?: string;
}) {
	return (
		<div
			className={
				"inline-block w-2/3 rounded-lg h-4 bg-white " + className
			}
			style={{ backgroundColor: backgroundColor ?? "white" }}>
			<div
				className="h-full overflow-x-hidden"
				style={{
					backgroundColor: color,
					width: `${percentage}%`,
					borderRadius: "inherit",
				}}></div>
		</div>
	);
}
