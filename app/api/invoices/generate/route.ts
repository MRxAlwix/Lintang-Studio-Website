import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const generateInvoiceHTML = (data: InvoiceData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 30px;
          background-color: #ffffff;
          color: #1f2937;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .company {
          font-size: 12px;
          color: #666666;
          margin-top: 5px;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          text-align: right;
        }
        .invoice-number {
          font-size: 14px;
          color: #666666;
          text-align: right;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .label {
          font-size: 12px;
          color: #666666;
          font-weight: bold;
        }
        .value {
          font-size: 12px;
          color: #1f2937;
        }
        .table {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }
        .table-header {
          background-color: #f3f4f6;
          padding: 10px;
          border-bottom: 1px solid #d1d5db;
        }
        .table-row {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .table-cell {
          padding: 10px;
          font-size: 12px;
        }
        .table-cell-header {
          padding: 10px;
          font-size: 12px;
          font-weight: bold;
          color: #374151;
        }
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          width: 200px;
          margin-left: auto;
          margin-bottom: 5px;
        }
        .total-label {
          font-size: 12px;
          color: #666666;
        }
        .total-value {
          font-size: 12px;
          color: #1f2937;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          width: 200px;
          margin-left: auto;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #2563eb;
        }
        .grand-total-label {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
        }
        .grand-total-value {
          font-size: 14px;
          font-weight: bold;
          color: #2563eb;
        }
        .footer {
          position: fixed;
          bottom: 30px;
          left: 30px;
          right: 30px;
          text-align: center;
          font-size: 10px;
          color: #666666;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }
        .status {
          background-color: #10b981;
          color: #ffffff;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
          text-align: center;
          margin-top: 10px;
          display: inline-block;
        }
        @media print {
          body { margin: 0; }
          .footer { position: absolute; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div>
          <div class="logo">Lintang Studio</div>
          <div class="company">Professional Technical Design Services</div>
          <div class="company">Email: admin@lintangstudio.com</div>
          <div class="company">WhatsApp: +62 812 3456 7890</div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${data.invoiceNumber}</div>
          <div class="invoice-number">${data.date}</div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="section">
        <div class="section-title">Bill To:</div>
        <div class="row">
          <span class="label">Customer Name:</span>
          <span class="value">${data.customerName}</span>
        </div>
        <div class="row">
          <span class="label">Email:</span>
          <span class="value">${data.customerEmail}</span>
        </div>
      </div>

      <!-- Service/Product Details -->
      <table class="table">
        <thead>
          <tr class="table-header">
            <th class="table-cell-header">Description</th>
            <th class="table-cell-header">Quantity</th>
            <th class="table-cell-header">Unit Price</th>
            <th class="table-cell-header">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="table-row">
            <td class="table-cell">${data.serviceType || data.pluginName || "Service"}</td>
            <td class="table-cell">1</td>
            <td class="table-cell">${formatCurrency(data.subtotal)}</td>
            <td class="table-cell">${formatCurrency(data.subtotal)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">${formatCurrency(data.subtotal)}</span>
        </div>
        ${
          data.discountAmount > 0
            ? `
        <div class="total-row">
          <span class="total-label">Discount:</span>
          <span class="total-value">-${formatCurrency(data.discountAmount)}</span>
        </div>
        `
            : ""
        }
        <div class="grand-total">
          <span class="grand-total-label">Total:</span>
          <span class="grand-total-value">${formatCurrency(data.totalAmount)}</span>
        </div>
        <div class="status">PAID</div>
      </div>

      <!-- Footer -->
      <div class="footer">
        Thank you for your business! This invoice was generated automatically by Lintang Studio system.<br>
        For any questions, please contact us at admin@lintangstudio.com
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const invoiceData: InvoiceData = await request.json()

    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoiceData)

    // For now, we'll store the HTML content and return the data
    // In production, you might want to use a service like Puppeteer to generate PDF
    const fileName = `${invoiceData.invoiceNumber}.html`

    // Upload HTML to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, htmlContent, {
        contentType: "text/html",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload invoice" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("invoices").getPublicUrl(fileName)

    // Save invoice record to database
    const { data: invoice, error: dbError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceData.invoiceNumber,
        customer_name: invoiceData.customerName,
        customer_email: invoiceData.customerEmail,
        service_type: invoiceData.serviceType,
        plugin_name: invoiceData.pluginName,
        subtotal: invoiceData.subtotal,
        discount_amount: invoiceData.discountAmount,
        total_amount: invoiceData.totalAmount,
        status: invoiceData.status,
        pdf_url: publicUrl,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invoice,
      invoiceUrl: publicUrl,
      htmlContent, // Return HTML for client-side PDF generation if needed
    })
  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get("customerEmail")
    const orderId = searchParams.get("orderId")
    const pluginPurchaseId = searchParams.get("pluginPurchaseId")

    let query = supabase.from("invoices").select("*").order("created_at", { ascending: false })

    if (customerEmail) {
      query = query.eq("customer_email", customerEmail)
    }

    if (orderId) {
      query = query.eq("order_id", orderId)
    }

    if (pluginPurchaseId) {
      query = query.eq("plugin_purchase_id", pluginPurchaseId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
