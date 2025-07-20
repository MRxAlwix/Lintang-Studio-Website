import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lintang Studio - Solusi Desain Teknik Profesional",
  description:
    "Jasa desain teknik AutoCAD 2D, SketchUp 3D, RAB, dan plugin premium untuk kebutuhan konstruksi dan arsitektur Anda.",
  keywords: "AutoCAD, SketchUp, RAB, desain teknik, konstruksi, arsitektur, plugin",
  authors: [{ name: "Abimanyu Lintang Wibowo" }],
  openGraph: {
    title: "Lintang Studio - Solusi Desain Teknik Profesional",
    description: "Jasa desain teknik AutoCAD 2D, SketchUp 3D, RAB, dan plugin premium",
    type: "website",
    locale: "id_ID",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
