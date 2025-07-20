import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { tableName: string } }) {
  try {
    const tableName = params.tableName

    // Validate table name
    const allowedTables = ["profiles", "services", "plugins", "orders", "plugin_purchases", "chat_rooms", "chats"]

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ error: "Table not allowed" }, { status: 400 })
    }

    // Get all data
    const { data, error } = await supabase.from(tableName).select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Export error:", error)
      return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 })
    }

    // Convert to CSV
    const columns = Object.keys(data[0])
    const csvHeader = columns.join(",")
    const csvRows = data.map((row) =>
      columns
        .map((col) => {
          const value = row[col]
          if (value === null) return ""
          if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(","),
    )

    const csvContent = [csvHeader, ...csvRows].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${tableName}_export.csv"`,
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
