import { makeQuotePDF, type Quote } from "./quote";

export async function makeReceiptPDF(invoice: Required<Omit<Quote, "declinedAt" | "expirationDate">>, stream: NodeJS.WritableStream) {

    makeQuotePDF(invoice, stream);

}
