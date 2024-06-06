import { LegacyRef } from "react";

export function Label({ content }: { content: string }): JSX.Element {
	return <label className="block text-sm font-medium leading-6 text-gray-900">
		{content}
	</label>
}

export function GenericUnitInput({ id, defaultValue, onChange, unit, placeHolder}: 
	{ id: string, placeHolder?: string, unit: string, defaultValue?: number, onChange?: (value: number) => void}): JSX.Element 
{
	return <>
		<div className="relative mt-2 rounded-md shadow-sm">
			<input
				type="text"
				name="price"
				id={id}
				className="block w-full rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
				placeholder={placeHolder}
				onBlur={(v) => 
				{
					if (onChange == null) return;
					
					let value = Number(v.target.value);

					onChange(value);
				}}
			/>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
				<span className="text-gray-500 sm:text-sm" id="price-currency">
					{unit}
				</span>
			</div>
		</div>
	</>
}


export function CurrencyInput({ id, ref, defaultValue, onChange}: { id: string, defaultValue?: number, onChange?: (value: number) => void, ref?: LegacyRef<HTMLInputElement>}): JSX.Element {
	return <>
		<div className="relative mt-2 rounded-md shadow-sm">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<span className="text-gray-500 sm:text-sm">$</span>
			</div>

			<input
				type="text"
				name="price"
				id={id}
				className="block w-full rounded-md border-0 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
				defaultValue={defaultValue?.toString()}
				aria-describedby="price-currency"
				ref={ref}
				onBlur={(v) => 
				{
					if (onChange == null) return;
					
					let value = Number(v.target.value);

					onChange(value);
				}}
			/>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
				<span className="text-gray-500 sm:text-sm" id="price-currency">
					USD
				</span>
			</div>
		</div>
	</>
}

export function DownloadButton({href}: {href: string})
{
	return <a href={href} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
		<svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
		<span>Download</span>
  	</a>
}