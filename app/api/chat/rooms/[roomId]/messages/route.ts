import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("room_id", params.roomId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json(chats || [])
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Verify room exists
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", params.roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
    }

    // Check rate limit
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
      p_room_id: params.roomId,
      p_user_email: room.client_email,
    })

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError)
      return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500 })
    }

    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ error: "rate_limited", reason: rateLimitCheck.reason }, { status: 429 })
    }

    // Create chat message
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        room_id: params.roomId,
        sender_id: room.client_email,
        sender_name: room.client_name,
        sender_type: "client",
        message: message.trim(),
      })
      .select()
      .single()

    if (chatError) {
      console.error("Chat creation error:", chatError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
