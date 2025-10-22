"use client"

import HorizontalWrap from "@/app/components/HorizontalWrap";
import { Quote } from "ams-pdf";
import { RegularSpinnerSolid } from "lineicons-react";
import { useCallback, useRef, useState } from "react";

const defaultQuote: Quote = {
    // quoteNumber: 0,
    // declinedAt: 
    expirationDate: new Date(Date.now() + 86400000 * 30),
    contact: {
        name: "Test User",
        email: "test@example.com",
    },
    preparer: {
        name: "Test Preparer",
        email: "preparer@example.com",
    },
    preparedAt: new Date(),
    payment: {
        paidAt: new Date(),
        paymentMethod: "TooCOOL",
        tooCOOLInvoice: 137015
    },
    feesCostInCents: 0,
    items: [
        {
            name: "Print Per Gram (PLA)",
            quantity: 19,
            unitCostInCents: 10,
            discountPercent: 0,
            description: "TooCOOL Item Purdue 3D Printing",
            taxInCents: 13
        },
    ]
}

export default function page() {

    const [isPending, setPending] = useState(false);
    const saveAnchorRef = useRef<HTMLAnchorElement>(undefined);
    const inputRef = useRef<HTMLTextAreaElement>(undefined);

    const doGeneratePDF = useCallback(async () => {

        if (!inputRef.current) return;

        console.log("Generating");

        setPending(true);

        try {
            const res = await fetch("/dashboard/maintainer/quote/routes/downloadQuotePDF", {
                method: "POST",
                credentials: "same-origin",
                body: inputRef.current.value
            });

            if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);


            const pdfBlob = await res.blob();
            const blobUrl = URL.createObjectURL(pdfBlob);

            if (saveAnchorRef.current) {
                saveAnchorRef.current.href = blobUrl;
                saveAnchorRef.current.click();
            }
        }
        catch (err) {

            console.error(err);
        }
        finally {

            setPending(false);

            console.log("Done!");
        }
    }, []);

    return <HorizontalWrap className="flex flex-col gap-4 mt-6">

        <textarea defaultValue={JSON.stringify(defaultQuote, null, 4)} className="min-h-72" ref={inputRef as any} />

        <a href="https://www.timestamp-converter.com/" target="_blank">https://www.timestamp-converter.com/</a>

        <button onClick={doGeneratePDF} className={"flex items-center gap-2 text-sm py-2.5 w-full font-normal "} type="submit" disabled={isPending}>
            Generate PDF
            {isPending && <RegularSpinnerSolid className={`inline-block h-auto w-auto animate-spin fill-white`} />}
        </button>

        <a target="_blank" download={"PDF"} className="hidden" ref={saveAnchorRef as any}>Save PDF</a>

    </HorizontalWrap>
}

