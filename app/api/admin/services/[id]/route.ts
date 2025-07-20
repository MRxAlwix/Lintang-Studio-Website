import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const { data: service, error } = await supabase
      .from("services")
      .update({
        name: data.name,
        description: data.description,
        base_price: data.base_price,
        price_per_m2: data.price_per_m2,
        min_area: data.min_area,
        complexity_factor: data.complexity_factor,
        category: data.category,
        features: data.features,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Service update error:", error)
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("services").delete().eq("id", params.id)

    if (error) {
      console.error("Service deletion error:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
