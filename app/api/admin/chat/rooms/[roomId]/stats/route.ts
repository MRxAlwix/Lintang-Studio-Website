import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { data: stats, error } = await supabase.rpc("get_user_status_summary", {
      p_room_id: params.roomId,
    })

    if (error) {
      console.error("Stats fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
