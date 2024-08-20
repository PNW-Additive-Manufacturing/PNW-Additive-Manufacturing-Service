import AMSIcon from "./AMSIcon";

export default function ErrorPrompt({
	code,
	details,
	children
}: {
	code: string;
	details: string;
	children?: React.ReactNode;
}) {
	return (
		<>
			<div className="mx-auto mb-4 w-fit pt-3">
				<AMSIcon />
			</div>
			<h1 className="mx-auto font-normal w-fit text-2xl">
				Status <span className="font-bold">{code}</span>
			</h1>
			<br />
			<p className="text-center">{details}</p>
			{children && (
				<>
					<br />
					{children}
				</>
			)}
		</>
	);
}
