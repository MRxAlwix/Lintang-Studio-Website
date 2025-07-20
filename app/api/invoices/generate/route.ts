import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface InvoiceData {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_name: string
  service_price: number
  plugin_name?: string
  plugin_price?: number
  promo_code?: string
  promo_discount?: number
  total_amount: number
  payment_status: string
  created_at: string
}

function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${data.id}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .invoice-container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-title {
          font-size: 24px;
          color: #1f2937;
          margin: 0;
        }
        .invoice-number {
          color: #6b7280;
          margin: 5px 0;
        }
        .invoice-date {
          color: #6b7280;
        }
        .billing-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .billing-section {
          flex: 1;
        }
        .billing-section h3 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .billing-section p {
          margin: 5px 0;
          color: #4b5563;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #1f2937;
        }
        .items-table tr:hover {
          background-color: #f9fafb;
        }
        .total-section {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row.final {
          border-bottom: 3px solid #3b82f6;
          font-weight: bold;
          font-size: 18px;
          color: #1f2937;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .company-info {
          margin-top: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body {
            background-color: white;
          }
          .invoice-container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Lintang Studio</div>
          <div class="invoice-info">
            <h1 class="invoice-title">INVOICE</h1>
            <p class="invoice-number">#${data.id}</p>
            <p class="invoice-date">${formatDate(data.created_at)}</p>
          </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-info">
          <div class="billing-section">
            <h3>Dari:</h3>
            <p><strong>Lintang Studio</strong></p>
            <p>Jasa Pembuatan Website & Aplikasi</p>
            <p>Email: admin@lintangstudio.com</p>
            <p>WhatsApp: +62 812 3456 7890</p>
          </div>
          <div class="billing-section">
            <h3>Kepada:</h3>
            <p><strong>${data.customer_name}</strong></p>
            <p>Email: ${data.customer_email}</p>
            <p>Phone: ${data.customer_phone}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${data.service_name}</strong>
                <br>
                <small>Jasa pembuatan website profesional</small>
              </td>
              <td>1</td>
              <td>${formatCurrency(data.service_price)}</td>
              <td>${formatCurrency(data.service_price)}</td>
            </tr>
            ${
              data.plugin_name
                ? `
            <tr>
              <td>
                <strong>${data.plugin_name}</strong>
                <br>
                <small>Plugin tambahan</small>
              </td>
              <td>1</td>
              <td>${formatCurrency(data.plugin_price || 0)}</td>
              <td>${formatCurrency(data.plugin_price || 0)}</td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <!-- Total Section -->
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency((data.service_price || 0) + (data.plugin_price || 0))}</span>
          </div>
          ${
            data.promo_code
              ? `
          <div class="total-row">
            <span>Diskon (${data.promo_code}):</span>
            <span>-${formatCurrency(data.promo_discount || 0)}</span>
          </div>
          `
              : ""
          }
          <div class="total-row final">
            <span>Total:</span>
            <span>${formatCurrency(data.total_amount)}</span>
          </div>
        </div>

        <!-- Payment Status -->
        <div style="margin-top: 30px;">
          <p><strong>Status Pembayaran:</strong> 
            <span class="status-badge ${data.payment_status === "paid" ? "status-paid" : "status-pending"}">
              ${data.payment_status === "paid" ? "LUNAS" : "MENUNGGU PEMBAYARAN"}
            </span>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda menggunakan jasa Lintang Studio!</p>
          <p>Untuk pertanyaan lebih lanjut, silakan hubungi kami di admin@lintangstudio.com</p>
        </div>

        <div class="company-info">
          <p>Lintang Studio - Professional Web Development Services</p>
          <p>Website: https://lintangstudio.com | Email: admin@lintangstudio.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        services (name, price),
        plugins (name, price)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      id: order.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      service_name: order.services?.name || "Custom Service",
      service_price: order.services?.price || order.total_amount,
      plugin_name: order.plugins?.name,
      plugin_price: order.plugins?.price,
      promo_code: order.promo_code,
      promo_discount: order.promo_discount,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      created_at: order.created_at,
    }

    // Generate HTML invoice
    const htmlContent = generateInvoiceHTML(invoiceData)

    // Save invoice to Supabase Storage
    const fileName = `invoice-${orderId}-${Date.now()}.html`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, htmlContent, {
        contentType: "text/html",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName)

    // Update order with invoice URL
    await supabase.from("orders").update({ invoice_url: urlData.publicUrl }).eq("id", orderId)

    return NextResponse.json({
      success: true,
      invoiceUrl: urlData.publicUrl,
      fileName: fileName,
      html: htmlContent,
    })
  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get order with invoice URL
    const { data: order, error } = await supabase.from("orders").select("invoice_url").eq("id", orderId).single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.invoice_url) {
      return NextResponse.json({ error: "Invoice not generated yet" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      invoiceUrl: order.invoice_url,
    })
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
