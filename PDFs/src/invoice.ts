import { makeQuotePDF, type Quote } from "./quote";

export async function makeInvoicePDF(invoice: Omit<Quote, "declinedAt" | "payment">, stream: NodeJS.WritableStream) {

	makeQuotePDF(invoice, stream);

}
