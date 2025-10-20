import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InvoiceData } from "@/types/invoice";

// Use default fonts instead of external font registration

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  logo: {
    height: 40,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#E53E3E",
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#E53E3E",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 10,
    color: "#6B7280",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 20,
  },
  billToSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
    color: "#1F2937",
  },
  clientInfo: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 5,
  },
  clientName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 5,
  },
  orderItem: {
    alignItems: "center",
  },
  orderLabel: {
    fontSize: 9,
    color: "#78350F",
    marginBottom: 2,
  },
  orderValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#78350F",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    padding: 10,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  descriptionCol: {
    flex: 3,
  },
  quantityCol: {
    flex: 1,
    textAlign: "center",
  },
  priceCol: {
    flex: 1.5,
    textAlign: "right",
  },
  totalCol: {
    flex: 1.5,
    textAlign: "right",
  },
  tableText: {
    fontSize: 10,
  },
  summarySection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
    width: 250,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 11,
    textAlign: "right",
    paddingRight: 20,
  },
  summaryValue: {
    flex: 1,
    fontSize: 11,
    textAlign: "right",
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: "#E53E3E",
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E53E3E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#E53E3E",
  },
  bankSection: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bankItem: {
    width: "50%",
    marginBottom: 10,
  },
  bankLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  bankValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 2,
  },
  statusBadge: {
    position: "absolute",
    top: 30,
    right: 30,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
});

interface InvoicePDFProps {
  invoice: InvoiceData;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "paid":
      return "#10B981";
    case "sent":
      return "#3B82F6";
    case "overdue":
      return "#EF4444";
    case "cancelled":
      return "#6B7280";
    default:
      return "#F59E0B";
  }
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "AED 0.00";
    }
    return `AED ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Status Badge */}
        {/* {invoice.status && ( */}
        {/*   <View */}
        {/*     style={[ */}
        {/*       styles.statusBadge, */}
        {/*       { backgroundColor: getStatusColor(invoice.status) + "20" }, */}
        {/*     ]} */}
        {/*   > */}
        {/*     <Text */}
        {/*       style={[ */}
        {/*         styles.statusText, */}
        {/*         { color: getStatusColor(invoice.status) }, */}
        {/*       ]} */}
        {/*     > */}
        {/*       {invoice.status} */}
        {/*     </Text> */}
        {/*   </View> */}
        {/* )} */}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{invoice.issuerName}</Text>
            <Text style={styles.companyInfo}>{invoice.issuerAddress}</Text>
            <Text style={styles.companyInfo}>Phone: {invoice.issuerPhone}</Text>
            <Text style={styles.companyInfo}>TRN: {invoice.issuerTrn}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(invoice.issueDate)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>BILL TO</Text>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{invoice.clientCompany}</Text>
            <Text style={styles.clientDetail}>{invoice.clientName}</Text>
            <Text style={styles.clientDetail}>{invoice.clientAddress}</Text>
            {invoice.clientTrn && (
              <Text style={styles.clientDetail}>TRN: {invoice.clientTrn}</Text>
            )}
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>{invoice.orderId}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>Due Date</Text>
            <Text style={styles.orderValue}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>Currency</Text>
            <Text style={styles.orderValue}>{invoice.currency}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.descriptionCol]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.quantityCol]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderText, styles.priceCol]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.totalCol]}>
              Total
            </Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableText, styles.descriptionCol]}>
                {item.description}
              </Text>
              <Text style={[styles.tableText, styles.quantityCol]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableText, styles.priceCol]}>
                {formatCurrency((item as any).unit_price || (item as any).unitPrice)}
              </Text>
              <Text style={[styles.tableText, styles.totalCol]}>
                {formatCurrency((item as any).total || (item as any).lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>
          {invoice.applyVat !== false && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (5%):</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.vatAmount)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>
              Total:
            </Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Bank Information */}
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
          <View style={styles.bankGrid}>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Account Holder</Text>
              <Text style={styles.bankValue}>{invoice.bankAccountHolder}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>IBAN</Text>
              <Text style={styles.bankValue}>{invoice.iban}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>SWIFT/BIC</Text>
              <Text style={styles.bankValue}>{invoice.swiftCode}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Bank Address</Text>
              <Text style={styles.bankValue}>{invoice.bankAddress}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
          <Text style={styles.footerText}>
            For any queries, please contact us at {invoice.issuerPhone}
          </Text>
          <Text style={styles.footerText}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
