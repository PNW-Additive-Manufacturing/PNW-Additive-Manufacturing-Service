import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import globalPDFStyles, { baseFont } from './Styles';

const CompanyLabelAndContactStyles = StyleSheet.create({
    infoText: {
        fontFamily: baseFont,
        fontSize: 12,
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontFamily: "Helvetica"
    },
});
export function CompanyLabelAndContact() {
    return <>
        <View style={globalPDFStyles.header}>
            <View>
                <Text style={CompanyLabelAndContactStyles.title}>
                    <Text style={{ color: '#b1810b' }}>PNW</Text> Additive Manufacturing Service
                </Text>
            </View>
        </View>

        <View style={globalPDFStyles.infoSection}>
            <Text style={CompanyLabelAndContactStyles.infoText}>Additive Manufacturing Club of PNW</Text>
            <Text style={CompanyLabelAndContactStyles.infoText}>2200 169th St, Hammond, IN 46323 (Design Studio)</Text>
            <Text style={CompanyLabelAndContactStyles.infoText}>For contact information, visit the team page at{" "}
                <Text style={{ textDecoration: 'underline' }}>pnw3d.com</Text>
            </Text>
        </View>

        <View style={globalPDFStyles.hr} />
    </>
}

export function FlexAcross({ children }: { children?: any }) {
    return <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {children}
    </View>
}