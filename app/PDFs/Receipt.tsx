import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { WalletTransaction } from '../Types/Account/Wallet';
import { formateDate } from '../api/util/Constants';
import Account from '../Types/Account/Account';
import globalPDFStyles from './Styles';
import { CompanyLabelAndContact, FlexAcross } from './Templates';

export function WalletTransactionReceiptPDF({ transaction }: { transaction: WalletTransaction & Account }) {
    return <Document>
        <Page style={globalPDFStyles.page}>
            <CompanyLabelAndContact />

            <Text style={{ fontSize: 14, marginBottom: "12px", color: "rgb(64, 64, 64)" }}>Receipt{"  "}#{transaction.id}</Text>

            <View style={globalPDFStyles.section}>
                <View>
                    <Text style={globalPDFStyles.detailHeader}>Payment Information:</Text>
                    <Text style={globalPDFStyles.infoText}>
                        Payment Status: <Text style={{ fontFamily: "Helvetica-Bold" }}>{transaction.paymentStatus.toUpperCase()}</Text>
                    </Text>
                    <Text style={globalPDFStyles.infoText}>
                        Payment Method: <Text style={{ fontFamily: "Helvetica-Bold" }}>{transaction.paymentMethod.toUpperCase()}</Text>
                    </Text>
                    {transaction.paidAt && (
                        <Text style={globalPDFStyles.infoText}>
                            Date: <Text style={{ fontFamily: "Helvetica-Bold" }}>{formateDate(transaction.paidAt)}</Text>
                        </Text>
                    )}
                </View>

                <View>
                    <Text style={globalPDFStyles.detailHeader}>Customer:</Text>
                    <Text style={globalPDFStyles.infoText}>
                        Name: <Text style={{ fontFamily: "Helvetica-Bold" }}>{transaction.firstName} {transaction.lastName}</Text>
                    </Text>
                    <Text style={globalPDFStyles.infoText}>
                        Email: <Text style={{ fontFamily: "Helvetica-Bold", textTransform: 'uppercase' }}>{transaction.accountEmail}</Text>
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
                    <View style={[globalPDFStyles.tableRow, globalPDFStyles.tableBodyRow]}>
                        <Text style={globalPDFStyles.tableCell}>Additive Manufacturing Service Funds</Text>
                        <Text style={globalPDFStyles.tableCell}>${(transaction.amountInCents / 100).toFixed(2)}</Text>
                        <Text style={globalPDFStyles.tableCell}>x1</Text>
                        <Text style={globalPDFStyles.tableCell}>${(transaction.amountInCents / 100).toFixed(2)}</Text>
                    </View>
                </View>

                <View style={globalPDFStyles.totalSection}>
                    <FlexAcross>
                        <Text style={globalPDFStyles.subtotalText}>
                            Subtotal
                        </Text>
                        <Text style={globalPDFStyles.subtotalText}>
                            ${(transaction.amountInCents / 100).toFixed(2)}
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
                            ${(transaction.amountInCents / 100).toFixed(2)}
                        </Text>
                    </FlexAcross>

                    {transaction.paidAt && (
                        <FlexAcross>
                            <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                                Paid by Customer
                            </Text>
                            <Text style={[globalPDFStyles.totalText, { fontFamily: "Helvetica-Bold" }]}>
                                ${(transaction.customerPaidInCents / 100).toFixed(2)}
                            </Text>
                        </FlexAcross>
                    )}
                </View>
            </View>
        </Page>
    </Document >
}
