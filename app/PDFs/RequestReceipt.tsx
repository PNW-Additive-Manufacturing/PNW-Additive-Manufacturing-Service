import { Page, Text, View, Document } from '@react-pdf/renderer';
import { formateDate } from '../api/util/Constants';
import globalPDFStyles from './Styles';
import { CompanyLabelAndContact, FlexAcross } from './Templates';
import { getCosts, RequestWithParts } from '../Types/Request/Request';

export function RequestReceiptPDF({ request }: { request: RequestWithParts }) {

    if (request.quote == null) throw new Error("Unable to generate RequestReceiptPDF without the request being quoted!");

    const isQuotePaid = request.quote && request.quote.isPaid;
    const receiptName = isQuotePaid ? "Receipt" : "Invoice";
    const requestCosts = getCosts(request.quote!);

    return <Document>
        <Page style={globalPDFStyles.page}>
            <CompanyLabelAndContact />

            <Text style={{ fontSize: 14, marginBottom: "12px", color: "rgb(64, 64, 64)" }}>{receiptName} for Request #{request.id}</Text>

            <View style={globalPDFStyles.section}>
                <View>
                    <Text style={globalPDFStyles.detailHeader}>Information:</Text>
                    <Text style={globalPDFStyles.infoText}>
                        Payment Status: <Text style={{ fontFamily: "Helvetica-Bold" }}>{isQuotePaid ? "Paid" : "Waiting for Payment"}</Text>
                    </Text>
                    <Text style={globalPDFStyles.infoText}>
                        Payment Method: <Text style={{ fontFamily: "Helvetica-Bold" }}>AMS Wallet</Text>
                    </Text>
                    {isQuotePaid && (
                        <Text style={globalPDFStyles.infoText}>
                            Paid Date: <Text style={{ fontFamily: "Helvetica-Bold" }}>{formateDate(request.quote!.paidAt)}</Text>
                        </Text>
                    )}
                </View>

                <View>
                    <Text style={globalPDFStyles.detailHeader}>Customer:</Text>
                    <Text style={globalPDFStyles.infoText}>
                        Name: <Text style={{ fontFamily: "Helvetica-Bold" }}>{`${request.firstName.trim()} ${request.lastName.trim()}`}</Text>
                    </Text>
                    <Text style={globalPDFStyles.infoText}>
                        Email: <Text style={{ fontFamily: "Helvetica-Bold", textTransform: 'uppercase' }}>{request.requesterEmail}</Text>
                    </Text>
                </View>
            </View>

            <View style={{ borderColor: "#e5e7eb", marginTop: "16px", borderWidth: "1.5px", borderRadius: "2px" }}>
                <View style={globalPDFStyles.table}>
                    <View style={[globalPDFStyles.tableRow, globalPDFStyles.tableHeaderRow]}>
                        <Text style={[globalPDFStyles.tableCell, globalPDFStyles.tableHeaderCell]}>Item</Text>
                        <Text style={[globalPDFStyles.tableCell, globalPDFStyles.tableHeaderCell]}>Amount</Text>
                        <Text style={[globalPDFStyles.tableCell, globalPDFStyles.tableHeaderCell]}>Quantity</Text>
                        <Text style={[globalPDFStyles.tableCell, globalPDFStyles.tableHeaderCell]}>Total</Text>
                    </View>
                    {request.parts.map(p => <View style={[globalPDFStyles.tableRow, globalPDFStyles.tableBodyRow]}>
                        <Text style={globalPDFStyles.tableCell}>{p.model.name}</Text>
                        <Text style={globalPDFStyles.tableCell}>${p.priceInDollars?.toFixed(2)}</Text>
                        <Text style={globalPDFStyles.tableCell}>x{p.quantity}</Text>
                        <Text style={globalPDFStyles.tableCell}>${(p.priceInDollars! * p.quantity).toFixed(2)}</Text>
                    </View>)}
                </View>

                <View style={globalPDFStyles.totalSection}>
                    <FlexAcross>
                        <Text style={globalPDFStyles.subtotalText}>
                            Subtotal
                        </Text>
                        <Text style={globalPDFStyles.subtotalText}>
                            ${(requestCosts.subTotal).toFixed(2)}
                        </Text>
                    </FlexAcross>

                    <FlexAcross>
                        <Text style={globalPDFStyles.subtotalText}>
                            Fees
                        </Text>
                        <Text style={globalPDFStyles.subtotalText}>
                            ${(requestCosts.fees).toFixed(2)}
                        </Text>
                    </FlexAcross>

                    <FlexAcross>
                        <Text style={globalPDFStyles.subtotalText}>Tax</Text>
                        <Text style={globalPDFStyles.subtotalText}>$0.00</Text>
                    </FlexAcross>

                    <FlexAcross>
                        <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                            Total
                        </Text>
                        <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                            ${requestCosts.totalCost.toFixed(2)}
                        </Text>
                    </FlexAcross>

                    {isQuotePaid && (
                        <FlexAcross>
                            <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                                Paid by Customer
                            </Text>
                            <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                                ${(request.quote!.totalPriceInCents / 100).toFixed(2)}
                            </Text>
                        </FlexAcross>
                    )}
                </View>
            </View>
        </Page>
    </Document >
}
