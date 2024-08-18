import { WalletTransaction } from "../Types/Account/Wallet";

export default function WalletTransactionViewer({
	walletTransaction
}: {
	walletTransaction: WalletTransaction;
}) {
	return <div>{walletTransaction.accountEmail}</div>;
}
