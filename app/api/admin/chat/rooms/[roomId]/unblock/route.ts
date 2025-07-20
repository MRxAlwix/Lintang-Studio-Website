import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    // Reset room restrictions
    const { error: roomError } = await supabase
      .from("chat_rooms")
      .update({
        is_input_disabled: false,
        disabled_until: null,
        user_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.roomId)

    if (roomError) {
      console.error("Room update error:", roomError)
      return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 })
    }

    // Reset user stats
    const { error: statsError } = await supabase
      .from("chat_user_stats")
      .update({
        is_rate_limited: false,
        rate_limit_until: null,
        rate_limit_violations: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("room_id", params.roomId)

    if (statsError) {
      console.error("Stats update error:", statsError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
