import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify Midtrans signature
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

    const serverKey = MIDTRANS_SERVER_KEY
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Update order status based on payment status
    let orderStatus = "pending_payment"

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        orderStatus = "paid"
      }
    } else if (transaction_status === "pending") {
      orderStatus = "pending_payment"
    } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
      orderStatus = "cancelled"
    }

    // Update order in database
    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: transaction_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // If payment successful, you can add additional logic here
    // like sending confirmation email, creating project folder, etc.
    if (orderStatus === "paid") {
      // TODO: Send confirmation email
      // TODO: Create project folder
      // TODO: Notify admin
      console.log(`Order ${order_id} payment confirmed`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
