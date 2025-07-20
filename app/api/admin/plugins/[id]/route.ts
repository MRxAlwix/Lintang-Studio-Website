import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const pluginId = params.id

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const version = formData.get("version") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as "autocad" | "sketchup"
    const features = (formData.get("features") as string).split("\n").filter((f) => f.trim())
    const file = formData.get("file") as File | null

    const updateData: any = {
      name,
      description,
      version,
      price,
      category,
      features,
    }

    // If new file is uploaded
    if (file && file.size > 0) {
      // Upload new file
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("plugin-files")
        .upload(fileName, file)

      if (uploadError) {
        console.error("File upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
      }

      updateData.file_url = uploadData.path
    }

    // Update plugin record
    const { data: plugin, error: pluginError } = await supabase
      .from("plugins")
      .update(updateData)
      .eq("id", pluginId)
      .select()
      .single()

    if (pluginError) {
      console.error("Plugin update error:", pluginError)
      return NextResponse.json({ error: "Failed to update plugin" }, { status: 500 })
    }

    return NextResponse.json(plugin)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pluginId = params.id

    // Get plugin to delete file
    const { data: plugin, error: getError } = await supabase
      .from("plugins")
      .select("file_url")
      .eq("id", pluginId)
      .single()

    if (getError) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 })
    }

    // Delete file from storage
    if (plugin.file_url) {
      await supabase.storage.from("plugin-files").remove([plugin.file_url])
    }

    // Delete plugin record
    const { error: deleteError } = await supabase.from("plugins").delete().eq("id", pluginId)

    if (deleteError) {
      console.error("Plugin deletion error:", deleteError)
      return NextResponse.json({ error: "Failed to delete plugin" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
