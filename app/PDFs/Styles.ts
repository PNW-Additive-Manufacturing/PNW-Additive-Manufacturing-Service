import { StyleSheet, Font } from "@react-pdf/renderer";
import WHAT from "@react-pdf/renderer";

export const baseFont = "Helvetica";

const globalPDFStyles = StyleSheet.create({
	text:
	{
		marginVertical: 10
	},
	page: {
		fontSize: 10,
		marginBottom: 4,
		padding: 36,
		flexDirection: "column",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 14,
	},
	infoSection: {
		// marginBottom: 16,
	},
	infoText: {
		fontSize: 10,
		marginBottom: 4,
		color: "rgb(64, 64, 64)"
	},
	detailHeader:
	{
		fontSize: "12px",
		marginBottom: "8px",
		fontWeight: "semibold",
		fontFamily: "Helvetica"
	},
	hr: {
		borderBottomWidth: 1,
		borderColor: "#c5c5c5",
		marginTop: 16,
		marginBottom: 28,
	},
	section: {
		flexDirection: "row",
		gap: "34px"
		// justifyContent: "",
	},
	table: {
		width: "100%",
		borderBottomWidth: 1,
		borderColor: "#e0e0e0",
	},
	tableRow: {
		flexDirection: "row",
		paddingHorizontal: "8px",
	},
	tableHeaderRow:
	{
		paddingTop: 5,
		paddingBottom: 5,
	},
	tableBodyRow:
	{
		backgroundColor: "rgb(248, 248, 248)",
		paddingTop: 10,
		paddingBottom: 10,
	},
	tableCell: {
		width: "25%",
		fontSize: 10,
		padding: 5,
		textAlign: "left",
		color: "rgb(64, 64, 64)",
		fontFamily: "Helvetica"
	},
	tableHeaderCell: {
		textTransform: "uppercase",
		fontSize: 8,
	},
	tableCellRight: {
		width: "25%",
		fontSize: 12,
		padding: 5,
		textAlign: "right",
	},
	tableHeader: {
		fontSize: 10,
		fontWeight: "bold",
		textTransform: "uppercase",
		borderBottomWidth: 1,
		borderColor: "#e0e0e0",
		paddingBottom: 5,
		paddingTop: 5,
		textAlign: "left",
	},
	totalSection: {
		// marginTop: 20,
		padding: "12px",
	},
	totalText: {
		paddingVertical: "2px",
		color: "rgb(64, 64, 64)",
		fontSize: 12,
		fontWeight: "bold",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	subtotalText: {
		paddingVertical: "2px",
		color: "rgb(64, 64, 64)",
		fontSize: 10,
		fontWeight: 300,
	},
});

export default globalPDFStyles;