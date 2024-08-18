export enum WalletTransactionPaymentMethod {
	Stripe = "stripe",
	Refund = "refund",
	None = "none"
}

export enum WalletTransactionStatus {
	Pending = "pending",
	Paid = "paid",
	Cancelled = "cancelled"
}

export interface WalletTransaction {
	id: string;
	accountEmail: string;
	amountInCents: number;
	taxInCents: number;
	feesInCents: number;
	paymentStatus: WalletTransactionStatus;
	paidAt?: Date;
	paymentMethod: WalletTransactionPaymentMethod;
	stripeCheckoutId?: string;
}

export function IsPayingWithStripe(walletTransaction: WalletTransaction) {
	return (
		walletTransaction.paymentMethod == WalletTransactionPaymentMethod.Stripe
	);
}
