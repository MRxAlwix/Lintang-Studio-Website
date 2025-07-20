import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: promos, error } = await supabase.from("promos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 })
    }

    return NextResponse.json(promos)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { data: promo, error } = await supabase
      .from("promos")
      .insert({
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        min_amount: data.min_amount || 0,
        max_discount: data.max_discount,
        usage_limit: data.usage_limit,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        applicable_to: data.applicable_to || "all",
        is_active: data.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("Promo creation error:", error)
      return NextResponse.json({ error: "Failed to create promo" }, { status: 500 })
    }

    return NextResponse.json(promo)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
