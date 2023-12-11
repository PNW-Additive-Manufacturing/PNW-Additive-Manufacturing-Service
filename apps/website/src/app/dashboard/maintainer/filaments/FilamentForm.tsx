import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { addFilament } from "@/app/api/server-actions/maintainer";

export function FilamentForm() {
	return <GenericFormServerAction serverAction={addFilament} submitName="Add Filament" submitPendingName="Adding Filament...">
		<Input type="text" name="filament-material" id="filament-material" label="Filament Material" placeholder="PLA, PETG, & More" />
		<Input type="text" name="filament-color" id="filament-color" label="Filament Color" placeholder="White, Black, Red & More" />

	</GenericFormServerAction>;
}
