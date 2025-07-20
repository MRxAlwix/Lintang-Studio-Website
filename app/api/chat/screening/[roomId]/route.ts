import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { data: screening, error } = await supabase
      .from("chat_screening")
      .select("*")
      .eq("room_id", params.roomId)
      .single()

    if (error || !screening) {
      return NextResponse.json({ error: "Screening not found" }, { status: 404 })
    }

    return NextResponse.json(screening)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
