import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get table information from information_schema
    const { data: tables, error } = await supabase.rpc("get_table_info")

    if (error) {
      console.error("Database error:", error)
      // Fallback to basic table list
      const basicTables = [
        { table_name: "profiles", row_count: 0, size: "Unknown" },
        { table_name: "services", row_count: 0, size: "Unknown" },
        { table_name: "plugins", row_count: 0, size: "Unknown" },
        { table_name: "orders", row_count: 0, size: "Unknown" },
        { table_name: "plugin_purchases", row_count: 0, size: "Unknown" },
        { table_name: "chat_rooms", row_count: 0, size: "Unknown" },
        { table_name: "chats", row_count: 0, size: "Unknown" },
      ]
      return NextResponse.json(basicTables)
    }

    return NextResponse.json(tables || [])
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
