export enum WalletTransactionPaymentMethod {
	Refund = "refund",
	Cash = "cash",
	Gift = "gift"
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
	feesInCents: number;
	paymentStatus: WalletTransactionStatus;
	paidAt?: Date;
	paymentMethod: WalletTransactionPaymentMethod;
	stripeCheckoutId?: string;
}