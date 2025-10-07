export function formatCurrencyUSD(amount: number) {
	return amount.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
    });
}