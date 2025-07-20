import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { data: room, error } = await supabase.from("chat_rooms").select("*").eq("id", params.roomId).single()

    if (error || !room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
