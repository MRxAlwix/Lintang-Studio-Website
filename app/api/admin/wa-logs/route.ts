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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const provider = searchParams.get("provider")

    let query = supabase.from("wa_logs").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (provider) {
      query = query.eq("provider", provider)
    }

    const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching wa-logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
