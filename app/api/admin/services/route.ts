import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }

    return NextResponse.json(services || [])
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { data: service, error } = await supabase
      .from("services")
      .insert({
        name: data.name,
        description: data.description,
        base_price: data.base_price,
        price_per_m2: data.price_per_m2,
        min_area: data.min_area,
        complexity_factor: data.complexity_factor,
        category: data.category,
        features: data.features,
        is_active: data.is_active,
      })
      .select()
      .single()

    if (error) {
      console.error("Service creation error:", error)
      return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
