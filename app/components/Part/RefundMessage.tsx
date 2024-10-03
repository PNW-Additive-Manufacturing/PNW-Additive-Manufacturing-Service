import Part, { isRefunded } from "@/app/Types/Part/Part";
import { Alert, AlertTitle, Button } from "@mui/material";

export default function RefundMessage({ part }: { part: Part }) {
	return (
		isRefunded(part) && (
			<Alert
				severity="error"
				action={
					<Button color="inherit" size="small">
						UNDO
					</Button>
				}>
				<AlertTitle>
					Refunded {part.refund!.quantity}{" "}
					{part.refund!.quantity > 1 ? "parts" : "part"} on{" "}
					{part.refund?.walletTransaction!.paidAt!.toLocaleDateString(
						"en-us",
						{
							weekday: "long",
							month: "short",
							day: "numeric"
						}
					)}{" "}
					for $
					{(
						part.refund?.walletTransaction.amountInCents! / 100
					).toFixed(2)}
				</AlertTitle>
				Reason: {part.refund!.reason}
			</Alert>
		)
	);
}
