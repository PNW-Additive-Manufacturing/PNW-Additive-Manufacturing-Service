"use client";
export function RequestOverview({
	title,
	description,
	actions,
	icon
}: {
	title: string;
	description: string;
	actions?: React.ReactNode;
	icon?: React.ReactNode;
}) {
	return (
		<div>
			<div className="shadow-sm p-4 lg:p-6 rounded-sm bg-white outline outline-2 outline-gray-200">
				<div className="lg:flex justify-between items-center">
					<div className="lg:flex gap-4">
						<h2 className="text-pnw-gold fill-pnw-gold">
							{icon && (
								<div className="inline-block mr-2">{icon}</div>
							)}
							{title}
						</h2>
						<p>{description}</p>
					</div>
				</div>
			</div>
			{actions && (
				<div className="flex gap-4 px-4 lg:px-6 mt-4">{actions}</div>
			)}
		</div>
	);
}
