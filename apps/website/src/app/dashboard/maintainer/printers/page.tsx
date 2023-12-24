
import db from '@/app/api/Database';
import { PrinterList, Printer } from './PrinterList';
import DropdownSection from '@/app/components/DropdownSection';
import GenericFormServerAction from '@/app/components/GenericFormServerAction';
import { Input } from '@/app/components/Input';
import { addPrinter } from '@/app/api/server-actions/printer';

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
		<DropdownSection name='Printers' collapsible={true}>
			<PrinterList initialPrinters={printers} />
		</DropdownSection>

		<DropdownSection hidden={true} name='Configure new Printer' className='mt-8'>
			<GenericFormServerAction serverAction={addPrinter} submitName="Add Printer" submitPendingName="Adding Printer...">
				<Input label="Printer Name" name="printer-name" type="text" id="printer-name" placeholder="ex: Printer 1" />
				<Input label="Printer Model" name="printer-model" type="text" id="printer-model" placeholder="ex: Creality Ender 3" />
				<div className="font-semibold">
					<p className="uppercase br-2">Dimensions in mm</p>
					<span>
						<input className="w-40 inline-block" type="number" name="printer-dimension1" placeholder="x"></input>
						<input className="w-40 inline-block" type="number" name="printer-dimension2" placeholder="y"></input>
						<input className="w-40 inline-block" type="number" name="printer-dimension3" placeholder="z"></input>
					</span>
				</div>
				<Input label="Communication Strategy" name="printer-communication" type="text" id="printer-communication" placeholder="MoonRaker, Serial, or Bambu" />
				<Input label="Communication Strategy Options" name="printer-communication-options" type="text" id="printer-communication-options" placeholder="Host, Extruder Count, Has Heated Bed" />
			</GenericFormServerAction>
		</DropdownSection>
	</>
}