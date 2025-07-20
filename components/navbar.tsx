"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/hooks/use-language"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const navItems = [
    { name: t("common.home"), href: "#home" },
    { name: t("common.services"), href: "#services" },
    { name: t("common.plugins"), href: "/plugins" },
    { name: t("common.portfolio"), href: "#portfolio" },
    { name: t("common.testimonials"), href: "#testimonials" },
    { name: t("common.contact"), href: "#contact" },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Lintang Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                {t("common.login")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Language</span>
                    <LanguageToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <User className="w-4 h-4 mr-2" />
                      {t("common.login")}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
