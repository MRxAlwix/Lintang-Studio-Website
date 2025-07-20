import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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

    // Upload file to Supabase Storage
    const fileName = `${params.roomId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("chat-files").upload(fileName, file)

    if (uploadError) {
      console.error("File upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Create chat message with file
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        room_id: params.roomId,
        sender_id: room.client_email,
        sender_name: room.client_name,
        sender_type: "client",
        file_url: uploadData.path,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()

    if (chatError) {
      console.error("Chat creation error:", chatError)
      return NextResponse.json({ error: "Failed to send file" }, { status: 500 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
