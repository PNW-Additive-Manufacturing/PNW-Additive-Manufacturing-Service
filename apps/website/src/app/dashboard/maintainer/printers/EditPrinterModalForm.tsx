import { PrinterForm } from "./PrinterForm";
import { Printer } from "./PrinterList";

export default function EditPrinter({
	doneEditingCallback,
	printer,
	filamentOptions
}: {
	doneEditingCallback: (p: Printer | null) => void;
	printer: Printer;
	filamentOptions: string[];
}) {
	//make parent element size of entire screen and add a semi-transparent background
	return (
		<div className="z-10 fixed px-[10vw] py-[10vh] h-screen inset-x-0 top-0 overflow-y-scroll bg-slate-800 bg-opacity-50">
			<PrinterForm
				addPrinterCallback={(p) => doneEditingCallback(p)}
				filamentOptions={filamentOptions}
				printerPreFill={printer}
			/>
		</div>
	);
}
