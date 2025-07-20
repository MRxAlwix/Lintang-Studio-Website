import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { tableName: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    const tableName = params.tableName

    // Validate table name to prevent SQL injection
    const allowedTables = ["profiles", "services", "plugins", "orders", "plugin_purchases", "chat_rooms", "chats"]

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ error: "Table not allowed" }, { status: 400 })
    }

    // Get total count
    const { count, error: countError } = await supabase.from(tableName).select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count error:", countError)
      return NextResponse.json({ error: "Failed to get count" }, { status: 500 })
    }

    // Get data with pagination
    const query = supabase
      .from(tableName)
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Data fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Get column names from first row
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    return NextResponse.json({
      columns,
      rows: data || [],
      total_count: count || 0,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
