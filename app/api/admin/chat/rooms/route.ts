import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get chat rooms with last message info
    const { data: rooms, error: roomsError } = await supabase
      .from("chat_rooms")
      .select(`
        *,
        chats!inner(
          message,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (roomsError) {
      console.error("Database error:", roomsError)
      return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 })
    }

    // Process rooms to get last message info
    const processedRooms = await Promise.all(
      (rooms || []).map(async (room: any) => {
        // Get last message for this room
        const { data: lastMessage } = await supabase
          .from("chats")
          .select("message, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        return {
          ...room,
          last_message: lastMessage?.message || null,
          last_message_time: lastMessage?.created_at || null,
        }
      }),
    )

    return NextResponse.json(processedRooms)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
