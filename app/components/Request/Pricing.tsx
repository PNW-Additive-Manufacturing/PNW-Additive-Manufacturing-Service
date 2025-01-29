import { formateDate, formateDateWithTime } from "@/app/api/util/Constants";
import Part, { isPriced, isRefunded, PartWithModel } from "@/app/Types/Part/Part";
import Request, {
	getLeadTimeInDays,
	calculateTotalCost,
	hasQuote,
	isAllPriced,
	RequestWithParts,
	isPaid
} from "@/app/Types/Request/Request";
import Table from "../Table";
import { useContext, useMemo } from "react";
import { RegularBookmark, RegularConsulting, RegularEmptyFile, RegularPencil } from "lineicons-react";
import classNames from "classnames";
import { FloatingFormContext } from "../FloatingForm";
import { EditableFigure, Figure } from "../Figures";

export function ItemizedPartTable({ parts }: { parts: PartWithModel[] }) {

	return <table className="bg-background px-1 py-2 w-full mt-1 out text-sm font-light overflow-x-scroll">
		<thead>
			<tr className="[&>th]:pt-3 [&>th]:text-xs">
				<th>Part name</th>
				<th>Unit Cost</th>
				<th>#</th>
				<th className="font-medium">Total</th>
			</tr>
		</thead>
		<tbody>
			{parts.map((part) => (
				<>
					<tr className="[&>td]:text-sm">
						<td className="first-letter:uppercase">{part.model.name}</td>
						<td>{part.priceInDollars && `\$${part.priceInDollars!.toFixed(2)}`}</td>
						<td>{part.quantity}</td>
						<td className="font-semibold">{isPriced(part) && `\$${(part.priceInDollars! * part.quantity).toFixed(2)}`}</td>
					</tr>
				</>
			))}
		</tbody >
	</table>

	// return <table className="w-full rounded-md out">
	// 	<thead>
	// 		<tr className="bg-background [&>th]:text-sm [&>th]:py-2.5">
	// 			<th>Part name</th>
	// 			<th>Unit Cost</th>
	// 			<th>Q</th>
	// 			<th>Total</th>
	// 		</tr>
	// 	</thead>
	// 	<tbody>
	// 		{parts.map((part) => (
	// 			<>
	// 				<tr className="[&>td]:text-sm">
	// 					<td>{part.model.name}</td>
	// 					<td>{part.priceInDollars && `\$${part.priceInDollars!.toFixed(2)}`}</td>
	// 					<td>{part.quantity}</td>
	// 					<td>{isPriced(part) && `\$${(part.priceInDollars! * part.quantity).toFixed(2)}`}</td>
	// 				</tr>
	// 			</>
	// 		))}
	// 	</tbody>
	// </table>
}

export function RequestTotals({ costs, onFeesUpdate }: { costs: ReturnType<typeof calculateTotalCost>, onFeesUpdate?: (amount: number) => void; }) {

	return <>

		{onFeesUpdate
			? <EditableFigure name="Fees" prefix="$" amount={costs.fees} style="small"
				formTitle={`Adjust Fees for Quote`}
				formDescription="Enter the fee amount to apply to the selected items in this quote. This will update the total accordingly."
				formDefaultValue={costs.fees.toFixed(2)}
				onEdit={(val) => onFeesUpdate(val)} />

			: <Figure name="Fees" prefix="$" amount={costs.fees} style="small" />}
		<Figure name="Tax" prefix="$" amount={0} style="small" />
		<Figure name="Subtotal" prefix="$" amount={costs.subTotal} style="small" />
		<Figure name="Total" prefix="$" amount={costs.totalCost} style="large" />
	</>;
}

export function DownloadItemizedReceipt({ request }: { request: Request }) {
	return <>

		<a href={`/api/download/request-receipt?requestId=${request.id}`} download>
			<button title="Download Itemized Receipt" type="button" className="bg-cool-black text-xs text-left mb-0">
				<RegularEmptyFile className="inline mr-1 my-auto fill-white mb-0.5" />
				Download Itemized {isPaid(request) ? "Receipt" : "Invoice"}
			</button>
		</a>

	</>;
}