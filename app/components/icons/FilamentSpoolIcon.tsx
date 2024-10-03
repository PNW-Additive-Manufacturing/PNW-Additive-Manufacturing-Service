import { SVGProps } from "react";

export default function FilamentSpoolIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			strokeLinecap="square"
			strokeMiterlimit={10}
			viewBox="0 0 960 960"
			{...props}>
			<clipPath id="a">
				<path d="M0 0h960v960H0V0z" />
			</clipPath>
			<g clipPath="url(#a)">
				<path fill="none" d="M0 0h960v960H0z" />
				<path
					fill="#000"
					fillRule="evenodd"
					d="M48 100.798A4.798 4.798 0 0 1 52.798 96H487.58a4.798 4.798 0 0 1 4.798 4.798v19.191a4.798 4.798 0 0 1-4.798 4.798H52.798A4.798 4.798 0 0 1 48 119.99z"
				/>
				<path
					fill="none"
					d="M48 480C48 241.413 241.413 48 480 48a432 432 0 0 1 432 432c0 238.587-193.413 432-432 432S48 718.587 48 480z"
				/>
				<path
					stroke="#000"
					strokeLinecap="butt"
					strokeLinejoin="round"
					strokeWidth={24}
					d="M48 480C48 241.413 241.413 48 480 48a432 432 0 0 1 432 432c0 238.587-193.413 432-432 432S48 718.587 48 480z"
				/>
				<path
					fillRule="evenodd"
					d="M96 480C96 267.923 267.923 96 480 96a384 384 0 0 1 384 384c0 212.077-171.923 384-384 384S96 692.077 96 480zm253.048 0c0 72.323 58.63 130.952 130.952 130.952 72.323 0 130.952-58.63 130.952-130.952 0-72.323-58.63-130.952-130.952-130.952-72.323 0-130.952 58.63-130.952 130.952z"
				/>
				<path
					fill="#000"
					fillRule="evenodd"
					d="M336 480c0-79.529 64.471-144 144-144a144 144 0 0 1 144 144c0 79.529-64.471 144-144 144s-144-64.471-144-144zm56.053 0c0 48.572 39.375 87.947 87.947 87.947s87.947-39.375 87.947-87.947-39.375-87.947-87.947-87.947-87.947 39.375-87.947 87.947z"
				/>
			</g>
		</svg>
	);
}
