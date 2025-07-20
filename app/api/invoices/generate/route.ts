import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Generate PDF using react-pdf (this would need to be implemented server-side)
    // For now, we'll return the invoice data and let the client generate the PDF

    return NextResponse.json({
      success: true,
      invoice,
      message: "Invoice data retrieved successfully",
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
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
