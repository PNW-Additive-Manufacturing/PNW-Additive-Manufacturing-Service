import { LegacyRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export function Label({ content }: { content: string }): React.ReactElement {
	return (
		<label className="text-gray-600">{content}</label>
	);
}

export function GenericUnitInput({
	id,
	defaultValue,
	onChange,
	unit,
	placeHolder,
	register
}: {
	id: string;
	placeHolder?: string;
	unit: string;
	defaultValue?: number;
	register?: UseFormRegisterReturn;
	onChange?: (value: number) => void;
}): React.ReactElement {
	return (
		<>
			<div className="relative mt-2 rounded-md shadow-sm">
				<input
					type="text"
					id={id}
					className="block w-full rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
					placeholder={placeHolder}
					{...register}
				/>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<span
						className="text-gray-500 sm:text-sm"
						id="price-currency">
						{unit}
					</span>
				</div>
			</div>
		</>
	);
}

export function CurrencyInput({
	id,
	ref,
	defaultValue,
	onChange,
	register,
	disabled
}: {
	id: string;
	defaultValue?: number;
	register?: UseFormRegisterReturn;
	onChange?: (value: number) => void;
	ref?: LegacyRef<HTMLInputElement>;
	disabled?: boolean;
}): React.ReactElement {
	disabled = disabled ?? false;

	return (
		<>
			<div className="relative mt-2 rounded-md shadow-sm w-full">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<span className="text-gray-500 sm:text-sm">$</span>
				</div>

				<input
					type="text"
					name={id}
					id={id}
					className="bg-gray-50 py-3.5 mb-0 block w-full rounded-md border-0 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
					defaultValue={defaultValue?.toFixed(2)}
					aria-describedby="price-currency"
					ref={ref}
					disabled={disabled}
					{...register}
					onBlur={(v) => {
						if (onChange == null) return;

						let value = Number(v.target.value);

						onChange(value);
					}}
				/>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<span
						className="text-gray-500 sm:text-sm"
						id="price-currency">
						Per-unit
					</span>
				</div>
			</div>
		</>
	);
}

export function DownloadButton({ href }: { href: string }) {
	return (
		<a
			href={href}
			className="bg-gray-200 hover:bg-pnw-gold text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
			<svg
				className="fill-current w-4 h-4 mr-2"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20">
				<path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
			</svg>
			<span>Download</span>
		</a>
	);
}
