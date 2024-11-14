import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import { isRefunded } from "@/app/Types/Part/Part";
import {
	getLeadTime,
	getTotalCost,
	hasQuote,
	isAllPriced,
	RequestWithParts
} from "@/app/Types/Request/Request";
import Table from "../Table";

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
		<div className="print:p-6">
			<div>
				{hasQuote(request) && <div className="hidden print:block">

					<h1 className="hidden print:block w-fit mb-4 text-2xl font-medium">
						<span className="text-pnw-gold"> PNW </span>
						Additive Manufacturing Service
					</h1>
					<h2 className="text-xl font-medium">Receipt for {request.name}.</h2>

					<hr />

					<div className="flex gap-12">
						<div>
							<label>Billing Information</label>
							<p className="text-sm">Name: {request.firstName} {request.lastName}</p>
							<p className="text-sm">Email: {request.requesterEmail}</p>
						</div>
						<div>
							<label>Requester Details</label>
							<p className="text-sm">Name: {request.name}</p>
							<p className="text-sm">Submit Date: {formateDate(request.submitTime)}</p>
							<p className="text-sm">Pay Date: {formateDate(request.quote!.paidAt)}</p>
						</div>
					</div>

					<hr />

				</div>}

				<Table className="hidden print:table">
					<thead>
						<tr>
							<th>Part</th>
							<th>Unit Cost</th>
							<th>Quantity</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{request.parts.map((part) => (
							<>
								<tr className="hidden print:table-row">
									<td>{part.model.name}</td>
									<td>${part.priceInDollars!.toFixed(2)}</td>
									<td>{part.quantity}</td>
									<td>${(part.priceInDollars! * part.quantity).toFixed(2)}</td>
								</tr>
							</>
						))}
					</tbody>
				</Table>
			</div>

			<div className="print:hidden">
				{request.parts.map(part => <p className="print:hidden text-sm text-nowrap overflow-ellipsis overflow-hidden mb-2 flex justify-between gap-4 w-full">
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
				</p>)}
			</div>

			<br className="hidden print:block my-2" />

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

			<p className="print:hidden text-sm font-light flex justify-between mt-4">
				<span className="text-nowrap">Lead-Time</span>
				<span className="text-right w-full">
					{leadTime} {leadTime > 1 ? "Days" : "Day"}
				</span>
			</p>
			{request.quote && <p className="print:hidden text-sm font-light flex justify-between mb-4">
				<span className="text-nowrap">Estimated Completion </span>
				<span className="text-right w-full">
					{formateDate(request.quote!.estimatedCompletionDate)}
				</span>
			</p>}

		</div>
	);
}
