import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true"

const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions"

export async function POST(request: NextRequest) {
  try {
    const { pluginId, customerName, customerEmail, customerWhatsapp } = await request.json()

    // Validate required fields
    if (!pluginId || !customerName || !customerEmail || !customerWhatsapp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get plugin details
    const { data: plugin, error: pluginError } = await supabase
      .from("plugins")
      .select("*")
      .eq("id", pluginId)
      .eq("is_active", true)
      .single()

    if (pluginError || !plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 })
    }

    // Generate unique purchase ID
    const purchaseId = `PLG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("plugin_purchases")
      .insert({
        id: purchaseId,
        plugin_id: pluginId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_whatsapp: customerWhatsapp,
        amount: plugin.price,
        status: "pending_payment",
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("Purchase creation error:", purchaseError)
      return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 })
    }

    // Create Midtrans payment
    if (MIDTRANS_SERVER_KEY && plugin.price > 0) {
      const midtransPayload = {
        transaction_details: {
          order_id: purchaseId,
          gross_amount: plugin.price,
        },
        customer_details: {
          first_name: customerName,
          email: customerEmail,
          phone: customerWhatsapp,
        },
        item_details: [
          {
            id: pluginId,
            price: plugin.price,
            quantity: 1,
            name: `Plugin: ${plugin.name}`,
            category: "Software Plugin",
          },
        ],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${purchaseId}`,
          error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?order_id=${purchaseId}`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending?order_id=${purchaseId}`,
        },
      }

      const midtransResponse = await fetch(MIDTRANS_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        },
        body: JSON.stringify(midtransPayload),
      })

      if (midtransResponse.ok) {
        const paymentData = await midtransResponse.json()

        // Update purchase with payment token
        await supabase.from("plugin_purchases").update({ payment_token: paymentData.token }).eq("id", purchaseId)

        return NextResponse.json({
          success: true,
          purchaseId: purchaseId,
          paymentUrl: paymentData.redirect_url,
          paymentToken: paymentData.token,
        })
      } else {
        console.error("Midtrans error:", await midtransResponse.text())
      }
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchaseId,
      message: "Purchase created successfully. You will be contacted soon.",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
