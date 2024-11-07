import { isRefunded } from "@/app/Types/Part/Part";
import {
	getTotalCost,
	hasQuote,
	isAllPriced,
	RequestWithParts
} from "@/app/Types/Request/Request";

export default function RequestPricing({
	request
}: {
	request: RequestWithParts;
}) {
	if (request == undefined)
		throw new TypeError("Request cannot be null while determining cost!");

	if (!isAllPriced(request))
		throw new TypeError(
			"All parts must be priced before creating an overview!"
		);

	const costs = getTotalCost(request);

	return (
		<>
			<>
				{request.parts.map((part) => (
					<p className="text-sm text-nowrap overflow-ellipsis overflow-hidden">
						{`\$${(part.priceInDollars! * part.quantity).toFixed(
							2
						)}`}{" "}
						{part.quantity > 1 ? (
							<>
								{` (\$${part.priceInDollars!.toFixed(
									2
								)} per Unit) `}{" "}
							</>
						) : (
							<></>
						)}
						{part.model.name} x{part.quantity}
						{isRefunded(part) && (
							<p className="text-red-500 text-sm">
								Refunded ({part.refund!.quantity} Unit
								{part.refund!.quantity > 1 && <>s</>}) $
								{(
									part.refund!.walletTransaction
										.amountInCents / 100
								).toFixed(2)}
							</p>
						)}
					</p>
				))}
			</>

			<hr className="my-4 block" />
			<p className="text-sm font-light flex justify-between">
				<span>Subtotal</span>
				<span className="text-right w-full">
					{" "}
					${costs.totalCost.toFixed(2)}
				</span>
			</p>
			<p className="text-sm font-light flex justify-between">
				<span>Fees</span>
				<span className="text-right w-full">
					{" "}
					${costs.fees.toFixed(2)}
				</span>
			</p>
			<p className="text-xl flex justify-between mt-1">
				<span className="font-semibold">Total</span>
				<span className="text-right w-full">
					{" "}
					${costs.totalCost.toFixed(2)}
				</span>
			</p>
		</>
	);
}
