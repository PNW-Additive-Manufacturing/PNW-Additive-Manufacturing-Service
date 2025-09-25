import classNames from "classnames";

export default function HorizontalWrap({
	children,
	className
}: {
	children: any;
	className?: string;
}) {
	return (
		<div
			className={classNames("mx-auto w-full px-6 lg:px-0 lg:w-3/4", className)}
			style={{ maxWidth: "1375px" }}>
			{children}
		</div>
	);
}
