import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import { isRefunded } from "@/app/Types/Part/Part";
import {
	getLeadTime,
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
	const leadTime = getLeadTime(request);

	return (
		<>
			<div>
				{request.parts.map((part) => (
					<p className="text-sm text-nowrap overflow-ellipsis overflow-hidden w-fit mb-2 flex justify-between gap-4 w-full">
						<span className="font-normal">
							{part.model.name} x{part.quantity}
						</span>
						<span className="text-gray-500">{`\$${(part.priceInDollars! * part.quantity).toFixed(
							2
						)}`}</span>
						{part.quantity > 1 ? (
							<>
								{` (\$${part.priceInDollars!.toFixed(
									2
								)} per Unit) `}{" "}
							</>
						) : (
							<></>
						)}
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
			</div>

			<p className="text-sm font-light flex justify-between">
				<span>Subtotal</span>
				<span className="text-right w-full text-gray-500">
					{" "}
					${costs.totalCost.toFixed(2)}
				</span>
			</p>
			{/* <p className="text-sm font-light flex justify-between">
				<span>Fees</span>
				<span className="text-right w-full text-gray-500">
					{" "}
					${costs.fees.toFixed(2)}
				</span>
			</p> */}
			<p className="text-xl flex justify-between mt-1">
				<span className="font-semibold">Total</span>
				<span className="text-right w-full text-gray-500">
					{" "}
					${costs.totalCost.toFixed(2)}
				</span>
			</p>

			<p className="text-sm font-light flex justify-between mt-4">
				<span className="text-nowrap">Lead-Time</span>
				<span className="text-right w-full">
					{leadTime} {leadTime > 1 ? "Days" : "Day"}
				</span>
			</p>
			{request.quote && <p className="text-sm font-light flex justify-between mb-4">
				<span className="text-nowrap">Estimated Completion </span>
				<span className="text-right w-full">
					{formateDate(request.quote!.estimatedCompletionDate)}
				</span>
			</p>}

		</>
	);
}
