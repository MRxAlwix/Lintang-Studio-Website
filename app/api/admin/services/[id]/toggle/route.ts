import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { is_active } = await request.json()

    const { data: service, error } = await supabase
      .from("services")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Service toggle error:", error)
      return NextResponse.json({ error: "Failed to toggle service status" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
