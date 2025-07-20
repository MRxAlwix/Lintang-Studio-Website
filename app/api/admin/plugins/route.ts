import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: plugins, error } = await supabase
      .from("plugins")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch plugins" }, { status: 500 })
    }

    return NextResponse.json(plugins)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const version = formData.get("version") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as "autocad" | "sketchup"
    const features = (formData.get("features") as string).split("\n").filter((f) => f.trim())
    const file = formData.get("file") as File

    if (!name || !description || !version || !price || !category || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("plugin-files").upload(fileName, file)

    if (uploadError) {
      console.error("File upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Create plugin record
    const { data: plugin, error: pluginError } = await supabase
      .from("plugins")
      .insert({
        name,
        description,
        version,
        price,
        category,
        features,
        file_url: uploadData.path,
        download_count: 0,
        rating: 5.0,
        is_active: true,
      })
      .select()
      .single()

    if (pluginError) {
      console.error("Plugin creation error:", pluginError)
      return NextResponse.json({ error: "Failed to create plugin" }, { status: 500 })
    }

    return NextResponse.json(plugin)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
