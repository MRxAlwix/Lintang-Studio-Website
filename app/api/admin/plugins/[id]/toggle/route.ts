import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { is_active } = await request.json()
    const pluginId = params.id

    const { data: plugin, error } = await supabase
      .from("plugins")
      .update({ is_active })
      .eq("id", pluginId)
      .select()
      .single()

    if (error) {
      console.error("Plugin toggle error:", error)
      return NextResponse.json({ error: "Failed to toggle plugin status" }, { status: 500 })
    }

    return NextResponse.json(plugin)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
