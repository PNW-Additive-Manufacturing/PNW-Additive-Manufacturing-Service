export default function Section({ children }: { children: any }) {
	return (
		<div className="p-6 shadow-md rounded-sm bg-white border-t-2 border-black">
			{children}
		</div>
	);
}
