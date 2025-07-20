import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { room_id, user_email } = await request.json()

    if (!room_id || !user_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the rate limit check function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_room_id: room_id,
      p_user_email: user_email,
    })

    if (error) {
      console.error("Rate limit check error:", error)
      return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500 })
    }

    // Get additional user status info
    const { data: statusData, error: statusError } = await supabase.rpc("get_user_status_summary", {
      p_room_id: room_id,
    })

    if (!statusError && statusData) {
      return NextResponse.json({
        ...data,
        ...statusData,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
