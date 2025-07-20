import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("file")

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Download file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage.from("chat-files").download(filePath)

    if (fileError) {
      console.error("File download error:", fileError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Get file name from path
    const fileName = filePath.split("/").pop() || "download"

    // Return file
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
