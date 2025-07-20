import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { serviceCategory, area, complexityFactor = 1.0 } = await request.json()

    if (!serviceCategory || !area) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the database function to calculate project time
    const { data, error } = await supabase.rpc("calculate_project_time", {
      service_category_input: serviceCategory,
      area_m2: area,
      complexity_factor: complexityFactor,
    })

    if (error) {
      console.error("Project time calculation error:", error)
      return NextResponse.json({ error: "Failed to calculate project time" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
