import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { data: screening, error } = await supabase
      .from("chat_screening")
      .insert({
        room_id: data.room_id,
        order_id: data.order_id,
        customer_email: data.customer_email,
        urgency_level: data.urgency_level,
        issue_category: data.issue_category,
        description: data.description,
        expected_response_time: data.expected_response_time,
        is_approved: true, // Auto-approve for now
      })
      .select()
      .single()

    if (error) {
      console.error("Screening creation error:", error)
      return NextResponse.json({ error: "Failed to create screening" }, { status: 500 })
    }

    return NextResponse.json(screening)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
