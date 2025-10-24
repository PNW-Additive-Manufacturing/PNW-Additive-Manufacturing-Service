"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus,faMinus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
export default function QuantityInput({
	name,
	defaultQuantity,
	min,
	max,
	className,
}: {
	name: string;
	defaultQuantity: number;
	min?: number;
	max?: number;
	className?: string;
}) {
	var [quantity, setQuantity] = useState<number>(defaultQuantity);

	function setQuantityClamped(newValue: number) {
		setQuantity(
			Math.min(Math.max(newValue, min ?? newValue), max ?? newValue),
		);
	}

	return (
		<div
			className={`flex border-solid border-gray-500 rounded-md ${className}`}>
			<div
				className="bg-white border border-gray-100 p-2 rounded-s-md hover:cursor-pointer"
				onClick={() => {
					setQuantityClamped(quantity + 1);
				}}>
				<FontAwesomeIcon icon={faPlus} className="w-4 h-4 fill-slate-400"></FontAwesomeIcon>
			</div>
			<input
				id="quantity"
				name={name}
				max={max}
				min={min}
				onInput={(ev) => {
					ev.preventDefault(); // Do not submit form.

					var inputNumber: String | Number = Number(
						ev.currentTarget.value,
					).toString();
					inputNumber = Number(
						inputNumber.charAt(inputNumber.length - 1),
					);

					if (Number.isNaN(inputNumber)) {
						ev.currentTarget.value = "1";
						return;
					}
					setQuantityClamped(inputNumber.valueOf());
				}}
				className="w-10 m-0 p-0 bg-white border-none rounded-none text-center hover:outline-none"
				value={quantity}></input>
			<div
				className="bg-white border border-gray-100 p-2 rounded-r-md hover:cursor-pointer"
				onClick={() => {
					setQuantityClamped(quantity - 1);
				}}>
				<FontAwesomeIcon icon={faMinus} className="w-4 h-4 fill-slate-400"></FontAwesomeIcon>
			</div>
		</div>
	);
}
