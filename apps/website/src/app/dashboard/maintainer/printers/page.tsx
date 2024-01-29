
import db from '@/app/api/Database';
import { PrinterList, Printer } from './PrinterList';
import { getFilamentList } from '@/app/api/server-actions/request-part';

export default async function Page() {
	let printers: Printer[] = (await db`select * from printer`).map((p) => {
		return {
			name: p.name,
			model: p.model,
			dimensions: p.dimensions,
			communicationstrategy: p.communicationstrategy,
			supportedMaterials: p.supportedmaterials
		};
	});

	//convert array to Set in order to remove duplicates
	let filamentMaterialsSet = new Set((await getFilamentList()).map(f => f.material));
	
	return <>
		<PrinterList initialPrinters={printers} filamentMaterials={Array.from(filamentMaterialsSet)}/>
	</>
}