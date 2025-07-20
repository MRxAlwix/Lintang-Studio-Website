"use client"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      className="h-9 px-3 text-sm font-medium"
    >
      {language === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
      <span className="sr-only">{t("common.switchLanguage")}</span>
    </Button>
  )
}
