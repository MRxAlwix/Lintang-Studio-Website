"use client"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      className="w-12 px-0 font-medium"
    >
      {language === "id" ? "🇮🇩" : "🇬🇧"}
      <span className="ml-1 text-xs">{language.toUpperCase()}</span>
    </Button>
  )
}
