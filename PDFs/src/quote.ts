import PDFDocument from "pdfkit";
import { z } from "zod";
import { BORDER_COLOR, COMPANY_ADDRESS, COMPANY_LOGO, COMPANY_NAME, FONT_SIZE } from "./constants";
import { docItem } from "./docElements";
import { docApplyStandardFont, docRegisterStandardFonts } from "./docFonts";
import { writePDFToStream } from "./docUtilities";
import { formatCurrencyUSD } from "./formatting";

export const QuoteItemSchema = z.object({

    name: z.string(),
    description: z.string().optional(),
    unitCostInCents: z.number().int().min(0),
    quantity: z.number().min(1),
    taxInCents: z.number(),
    discountPercent: z.number().min(0).max(1)

});

export type QuoteItem = z.infer<typeof QuoteItemSchema>;

export const QuotePayment = z
    .object({ paidAt: z.coerce.date() })
    .and(
        z.object({ paymentMethod: z.literal("TooCOOL"), tooCOOLInvoice: z.number() }).or(
            z.object({ paymentMethod: z.string() })));

export const QuoteSchema = z.object({

    quoteNumber: z.string().optional(),
    preparer: z.object({ name: z.string(), email: z.email() }).optional(),
    preparedAt: z.coerce.date().optional(),
    expirationDate: z.coerce.date().optional(),
    declinedAt: z.coerce.date().optional(),
    contact: z.object({ name: z.string(), email: z.email() }),
    items: QuoteItemSchema.array().min(1),
    feesCostInCents: z.coerce.number().default(0),
    payment: QuotePayment.optional()

});

export type Quote = z.infer<typeof QuoteSchema>;

export function calculateQuoteItemTotalsInCents(item: QuoteItem) {
    const subtotal = item.unitCostInCents * item.quantity;
    const discount = subtotal * (item.discountPercent ?? 0);
    const total = subtotal - discount + item.taxInCents;

    return { subtotal, discount, total };
}

export function calculateQuoteTotalsInCents(quote: Quote) {
    const subtotal = quote.items.reduce((sum, item) => sum + (item.unitCostInCents * item.quantity), 0);

    const discount = quote.items.reduce((sum, item) => {
        const itemSubtotal = item.unitCostInCents * item.quantity;
        return sum + (itemSubtotal * (item.discountPercent ?? 0));
    }, 0);

    const tax = quote.items.reduce((sum, item) => sum += item.taxInCents, 0);

    const total = subtotal - discount + tax + quote.feesCostInCents;

    return { subtotal, discount, tax, fees: quote.feesCostInCents, total };
}

export async function makeQuotePDF(quote: Quote, stream: NodeJS.WritableStream) {

    const doc = new PDFDocument({ size: "LETTER", compress: true, font: "" });
    // font: "" is a sneaky trick to avoid PDFKit crashing when attempting to load the default Helvetica font on node without it being present.

    docRegisterStandardFonts(doc);
    docApplyStandardFont(doc);

    const startY = doc.y - doc.currentLineHeight(true);
    const imgH = doc.currentLineHeight(true) * 7.5;
    const logoX = doc.page.width - doc.page.margins.right - imgH;

    doc.image(COMPANY_LOGO, logoX, doc.page.margins.top, { height: imgH });
    doc.fontSize(FONT_SIZE - 1).text(COMPANY_NAME, logoX, doc.page.margins.top + imgH + 7, {
        width: imgH,
        align: "center"
    });

    doc.lineGap(6).fontSize(FONT_SIZE);
    doc.x = doc.page.margins.left;
    doc.y = startY;
    doc.moveDown();

    // Quote details
    const labelCol = doc.widthOfString("Company Address");

    doc.font("Inter-Bold");
    doc.text(`${(quote.payment ? "Receipt" : "Quote")} ${(quote.quoteNumber ? `${quote.quoteNumber}` : "")}`);
    // docItem(doc, quote.payment ? "Receipt" : "Quote", labelCol, quote.quoteNumber ? `${quote.quoteNumber}` : "");
    doc.font("Inter");

    const showExpirationDate = quote.expirationDate && !quote.payment && !quote.declinedAt;
    
    if (quote.preparedAt || quote.preparer || showExpirationDate)
    {       
        doc.moveDown();
    }

    if (quote.preparedAt)
    {
        docItem(doc, "Prepared At", labelCol, quote.preparedAt.toLocaleDateString());
    }

    if (quote.preparer) {
        docItem(doc, "Prepared By", labelCol, quote.preparer.name);
        docItem(doc, "Email", labelCol, quote.preparer.email);
    }

    if (showExpirationDate) {
        docItem(doc, "Expiration Date", labelCol, quote.expirationDate!.toLocaleDateString());
    }

    doc.moveDown();

    docItem(doc, "Customer Name", labelCol, quote.contact.name);
    docItem(doc, "Customer Email", labelCol, quote.contact.email);

    doc.moveDown();

    docItem(doc, "Company Name", labelCol, "Additive Manufacturing Club of Purdue Northwest University", {
        link: "https://www.pnw.edu/student-life/get-involved/organizations-listing/additive-manufacturing-club-of-pnw/"
    });
    docItem(doc, "Company Address", labelCol, COMPANY_ADDRESS);

    doc.moveDown();

    // Items table
    doc.fontSize(FONT_SIZE - 1);
    doc.table({
        maxWidth: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        data: [
            ["ITEM NAME", "UNIT COST", "QUANTITY", "SUBTOTAL"],
            ...quote.items.map(item => {

                const totals = calculateQuoteItemTotalsInCents(item);
                const discountText = (item.discountPercent ?? 0) > 0
                    ? ` (${((item.discountPercent ?? 0) * 100).toFixed(0)}% Off)`
                    : "";

                const itemName = item.description
                    ? `${item.name} (${item.description})`
                    : item.name;

                return [
                    itemName,
                    formatCurrencyUSD(item.unitCostInCents / 100),
                    `${item.quantity}`,
                    formatCurrencyUSD(totals.subtotal / 100) + discountText
                ];
            })
        ],
        rowStyles: (i: number) => ({
            borderColor: BORDER_COLOR,
            backgroundColor: i % 2 === 0 ? "#fafafa" : "#f1f1f1",
            padding: [7, 7, 2, 7],
            ...(i === 0 && { border: [1, 1, 0, 1] })
        }),
        columnStyles: [200, "*", doc.widthOfString("QUANTITY") + 20, 100]
    });
    doc.fontSize(FONT_SIZE);

    doc.moveDown();

    const prevY = doc.y;

    if (!quote.payment) {
        doc.fontSize(FONT_SIZE - 1);

        doc.font("Inter").text(
            "Payments should be made to the Additive Manufacturing Club at Purdue Northwest via COOL, uStore, or cash. If you pay via COOL/uStore, notify the preparer or club officers and include your invoice number to ensure timely processing. RSOs, research projects, and grant-funded programs can typically pursue collegiate reimbursement. Work begins after payment is confirmed.",
            { width: 250 }
        );
    }

    docApplyStandardFont(doc);

    // Totals section
    const totals = calculateQuoteTotalsInCents(quote);
    const totalLabelWidth = doc.font("Inter-Bold").widthOfString("TooCOOL Invoice #");
    const totalsX = !quote.payment ? 350 : doc.page.margins.left;

    doc.font("Inter");

    docItem(doc, "Subtotal", totalLabelWidth, formatCurrencyUSD(totals.subtotal / 100), {}, totalsX, prevY);

    if (totals.discount > 0) {
        docItem(doc, "Discount", totalLabelWidth, `-${formatCurrencyUSD(totals.discount / 100)}`, {}, totalsX);
    }

    docItem(doc, "Tax", totalLabelWidth, formatCurrencyUSD(totals.tax / 100), {}, totalsX);

    if (totals.fees > 0) {
        docItem(doc, "Fees", totalLabelWidth, formatCurrencyUSD(totals.fees / 100), {}, totalsX);
    }

    doc.font("Inter-Bold");
    docItem(doc, "Grand Total", totalLabelWidth, formatCurrencyUSD(totals.total / 100), {}, totalsX);

    if (quote.payment)
    {
        docItem(doc, "Paid by Customer", totalLabelWidth, formatCurrencyUSD(totals.total / 100), {}, totalsX);
    }

    if (quote.declinedAt) {

        docItem(doc, "Declined Date", totalLabelWidth, quote.declinedAt.toLocaleDateString(), {}, totalsX);

    } else if (quote.payment && quote.payment.paidAt) {

        docItem(doc, "Payment Date", totalLabelWidth, quote.payment.paidAt.toLocaleDateString(), {}, totalsX);

        if ("tooCOOLInvoice" in quote.payment) {
            docItem(doc, "TooCOOL Invoice #", totalLabelWidth, quote.payment.tooCOOLInvoice, {}, totalsX);
        }
        else {
            docItem(doc, "Payment Method", totalLabelWidth, quote.payment.paymentMethod, {}, totalsX);
        }
    }

    docApplyStandardFont(doc);

    doc.moveDown();
    doc.moveDown();

    doc.fontSize(FONT_SIZE - 1);

    // Footer
    const footerY = doc.page.height - doc.page.margins.bottom - doc.currentLineHeight(true) * 2;
    doc.text(COMPANY_ADDRESS, doc.page.margins.left, footerY, { align: "center" });
    doc.text("pnw3d.com", doc.page.margins.left, footerY + doc.currentLineHeight(true), {
        align: "center",
        link: "https://pnw3d.com"
    });

    writePDFToStream(doc, stream);

}