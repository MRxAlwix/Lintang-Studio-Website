import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json()

    const { data, error } = await supabase
      .from("wa_logs")
      .insert([
        {
          phone_number: logData.phone,
          message: logData.message,
          status: logData.status,
          provider: logData.provider,
          response_data: logData.responseData,
          order_id: logData.orderId || null,
          plugin_purchase_id: logData.pluginPurchaseId || null,
        },
      ])
      .select()

    if (error) {
      console.error("Error logging WhatsApp message:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in wa-logs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from("wa_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch WhatsApp logs" }, { status: 500 })
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
