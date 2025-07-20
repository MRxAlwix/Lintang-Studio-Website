import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendWhatsAppMessage, formatPhoneNumber, validatePhoneNumber } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, type = "text", orderId, pluginPurchaseId } = await request.json()

    // Validate input
    if (!phone || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone)
    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage({
      phone: formattedPhone,
      message,
      type,
      orderId,
      pluginPurchaseId,
    })

    // Log to database
    const { error: logError } = await supabase.from("wa_logs").insert({
      recipient_phone: formattedPhone,
      message_type: type,
      message_content: message,
      status: result.success ? "sent" : "failed",
      provider: result.provider,
      response_data: result,
      error_message: result.error,
      order_id: orderId,
      plugin_purchase_id: pluginPurchaseId,
    })

    if (logError) {
      console.error("Failed to log WhatsApp message:", logError)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
      })
    } else {
      return NextResponse.json({ error: result.error, provider: result.provider }, { status: 500 })
    }
  } catch (error) {
    console.error("WhatsApp API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
