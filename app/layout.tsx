import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lintang Studio - Professional Technical Design Services",
  description: "Jasa AutoCAD, SketchUp, RAB, dan Plugin Premium untuk Kebutuhan Konstruksi Anda",
  keywords: "AutoCAD, SketchUp, RAB, Jasa Desain, Plugin, Konstruksi, Arsitektur",
  authors: [{ name: "Lintang Studio" }],
  creator: "Lintang Studio",
  publisher: "Lintang Studio",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://lintangstudio.com",
    title: "Lintang Studio - Professional Technical Design Services",
    description: "Jasa AutoCAD, SketchUp, RAB, dan Plugin Premium untuk Kebutuhan Konstruksi Anda",
    siteName: "Lintang Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lintang Studio - Professional Technical Design Services",
    description: "Jasa AutoCAD, SketchUp, RAB, dan Plugin Premium untuk Kebutuhan Konstruksi Anda",
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
          <LanguageProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
