import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // For now, return empty array since we don't have user authentication
    // In a real app, you would get the user ID from the session
    const { data: purchases, error } = await supabase.from("plugin_purchases").select("plugin_id").eq("status", "paid")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(purchases || [])
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json([])
  }
}
