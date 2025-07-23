"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant={language === "EN" ? "default" : "ghost"}
        onClick={() => setLanguage("EN")}
        className="text-xs px-2 py-1 h-7"
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={language === "RU" ? "default" : "ghost"}
        onClick={() => setLanguage("RU")}
        className="text-xs px-2 py-1 h-7"
      >
        RU
      </Button>
    </div>
  )
}
