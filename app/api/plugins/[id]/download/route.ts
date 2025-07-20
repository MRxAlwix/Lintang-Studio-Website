import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pluginId = params.id

    // Check if user has purchased this plugin
    // For now, we'll skip this check since we don't have user authentication
    // In a real app, you would verify the user's purchase

    // Get plugin details
    const { data: plugin, error: pluginError } = await supabase.from("plugins").select("*").eq("id", pluginId).single()

    if (pluginError || !plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 })
    }

    // Get file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage.from("plugin-files").download(plugin.file_url)

    if (fileError) {
      console.error("File download error:", fileError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Update download count
    await supabase
      .from("plugins")
      .update({ download_count: plugin.download_count + 1 })
      .eq("id", pluginId)

    // Return file
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${plugin.name}-v${plugin.version}.zip"`,
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
