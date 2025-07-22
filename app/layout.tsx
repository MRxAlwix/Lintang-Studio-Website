import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lintang Studio - Jasa Desain Teknik & Plugin Professional",
  description:
    "Layanan profesional desain teknik AutoCAD, SketchUp 3D, RAB, dan plugin custom. Dipercaya oleh 500+ klien di seluruh Indonesia.",
  keywords: "desain teknik, autocad, sketchup, RAB, plugin, jasa desain, teknik sipil",
  authors: [{ name: "Abimanyu Lintang Wibowo" }],
  openGraph: {
    title: "Lintang Studio - Jasa Desain Teknik Professional",
    description: "Layanan profesional desain teknik dan plugin custom",
    url: "https://lintangstudio.com",
    siteName: "Lintang Studio",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
