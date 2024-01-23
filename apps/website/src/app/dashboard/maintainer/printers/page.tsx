
import db from '@/app/api/Database';
import { PrinterList, Printer } from './PrinterList';

export default async function Page() {
	let printers: Printer[] = (await db`select * from printer`).map((p) => {
		return {
			name: p.name,
			model: p.model,
			dimensions: p.dimensions,
			communicationstrategy: p.communicationstrategy
		};
	});
	return <>
		<PrinterList initialPrinters={printers} />
	</>
}