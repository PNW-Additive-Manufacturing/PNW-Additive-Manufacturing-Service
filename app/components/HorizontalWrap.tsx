export default function HorizontalWrap({
	children,
	className
}: {
	children: any;
	className?: string;
}) {
	return (
		<div
			className={`mx-auto w-full px-6 lg:px-0 lg:w-3/4 xl:w-3/4 ${className ?? ""
				}`}
			style={{ maxWidth: "1500px" }}>
			{children}
		</div>
	);
}
