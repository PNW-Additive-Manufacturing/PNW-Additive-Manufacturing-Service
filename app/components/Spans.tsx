export function CurrencySpan({ amount }: { amount: number }) {
	return (
		<span className="bg-green-300 text-black inline rounded-md pl-2 pr-2 pt-1 pb-1">
			${amount}
		</span>
	);
}
