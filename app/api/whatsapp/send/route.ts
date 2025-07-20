import { type NextRequest, NextResponse } from "next/server"
import { whatsappService } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, orderId, pluginPurchaseId } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    const result = await whatsappService.sendMessage({
      phone,
      message,
      orderId,
      pluginPurchaseId,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "WhatsApp message sent successfully",
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
