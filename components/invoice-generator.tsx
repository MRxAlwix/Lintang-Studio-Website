"use client"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface InvoiceData {
  invoiceNumber: string
  date: string
  customerName: string
  customerEmail: string
  serviceType?: string
  pluginName?: string
  subtotal: number
  discountAmount: number
  totalAmount: number
  status: string
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  company: {
    fontSize: 12,
    color: "#666666",
    marginTop: 5,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#666666",
    textAlign: "right",
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "bold",
  },
  value: {
    fontSize: 12,
    color: "#1f2937",
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  totalSection: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666666",
  },
  totalValue: {
    fontSize: 12,
    color: "#1f2937",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: "#2563eb",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  status: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const InvoicePDF = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Lintang Studio</Text>
          <Text style={styles.company}>Professional Technical Design Services</Text>
          <Text style={styles.company}>Email: admin@lintangstudio.com</Text>
          <Text style={styles.company}>WhatsApp: +62 812 3456 7890</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          <Text style={styles.invoiceNumber}>{data.date}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Customer Name:</Text>
          <Text style={styles.value}>{data.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.customerEmail}</Text>
        </View>
      </View>

      {/* Service/Product Details */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Description</Text>
          <Text style={styles.tableCellHeader}>Quantity</Text>
          <Text style={styles.tableCellHeader}>Unit Price</Text>
          <Text style={styles.tableCellHeader}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{data.serviceType || data.pluginName || "Service"}</Text>
          <Text style={styles.tableCell}>1</Text>
          <Text style={styles.tableCell}>{formatCurrency(data.subtotal)}</Text>
          <Text style={styles.tableCell}>{formatCurrency(data.subtotal)}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
        </View>
        {data.discountAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>-{formatCurrency(data.discountAmount)}</Text>
          </View>
        )}
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(data.totalAmount)}</Text>
        </View>
        <View style={styles.status}>
          <Text>PAID</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for your business! This invoice was generated automatically by Lintang Studio system.
        {"\n"}For any questions, please contact us at admin@lintangstudio.com
      </Text>
    </Page>
  </Document>
)

interface InvoiceGeneratorProps {
  data: InvoiceData
  onGenerated?: (pdfBlob: Blob) => void
}

export function InvoiceGenerator({ data, onGenerated }: InvoiceGeneratorProps) {
  const handleGeneratePDF = async () => {
    try {
      const pdfBlob = await pdf(<InvoicePDF data={data} />).toBlob()
      onGenerated?.(pdfBlob)
      return pdfBlob
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw error
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <PDFDownloadLink
        document={<InvoicePDF data={data} />}
        fileName={`${data.invoiceNumber}.pdf`}
        className="inline-flex"
      >
        {({ loading }) => (
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>

      <Button variant="ghost" size="sm" onClick={handleGeneratePDF} className="text-blue-600 hover:text-blue-700">
        <FileText className="w-4 h-4 mr-2" />
        Generate
      </Button>
    </div>
  )
}
