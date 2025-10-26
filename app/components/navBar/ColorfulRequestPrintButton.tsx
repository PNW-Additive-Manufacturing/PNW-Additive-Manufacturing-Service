

import Link from "next/link";

export function ColorfulRequestPrintButton() {
    return (
        <Link href={"/request-part"}>
            <button
                className="px-3 py-1.5 mb-0 text-sm bg-white outline-2 text-pnw-gold fill-pnw-gold outline outline-pnw-gold tracking-wider font-bold uppercase shadow-sm">
                Start Printing
            </button>
        </Link>
    );
}