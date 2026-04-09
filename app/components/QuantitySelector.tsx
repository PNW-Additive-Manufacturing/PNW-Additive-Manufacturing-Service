"use client";

import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function QuantitySelector({ value = 1, min = 1, max = 100, onChange }: { value?: number; min?: number; max?: number; onChange?: (val: number) => void }) {
    const [qty, setQty] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => setQty(value), [value]);

    const update = (newVal: number) => {
        if (isNaN(newVal)) return;

        const clamped = Math.min(Math.max(newVal, min), max);
        setQty(clamped);
        onChange?.(clamped);

        if (inputRef.current) inputRef.current.valueAsNumber = newVal; 
    };

    const handleIncrement = () => {
        if (qty < max) update(qty + 1);
    };

    const handleDecrement = () => {
        if (qty > min) update(qty - 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.valueAsNumber;
        update(newValue);
    };

    return <>

        <div className="flex gap-4 items-center">
            <div className="flex gap-1 h-12 text-sm">
                <div
                    className="p-1 bg-background flex items-center justify-center h-full aspect-square border-2 border-black/10 rounded-l-sm hover:bg-white hover:cursor-pointer"
                    onClick={handleDecrement}>
                    <FaMinus />
                </div>
                <div className="border-2 border-black/10 bg-background">
                    <input ref={inputRef as any} type="number" min={min} max={max} defaultValue={value} onChange={handleInputChange} className="font-semibold w-fit min-w-16 h-full mb-0 px-4 py-0" style={{ outline: "none" }} />
                </div>
                <div
                    className="p-1 bg-background flex items-center justify-center h-full aspect-square border-2 border-black/10 rounded-r-sm hover:bg-white hover:cursor-pointer"
                    onClick={handleIncrement}>
                    <FaPlus />
                </div>
            </div>
        </div>

    </>
}