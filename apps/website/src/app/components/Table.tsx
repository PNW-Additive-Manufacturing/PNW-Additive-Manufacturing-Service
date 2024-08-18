import { DetailedHTMLProps, TableHTMLAttributes } from "react";

export default function Table(
	props: DetailedHTMLProps<
		TableHTMLAttributes<HTMLTableElement>,
		HTMLTableElement
	>,
): JSX.Element {
	return (
		<div
			{...props}
			className={`w-full overflow-x-auto overflow-y-auto ${props.className}`}>
			<table className="table-auto w-full">{props.children}</table>
		</div>
	);
}
