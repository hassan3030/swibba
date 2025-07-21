"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"

export function LanguageToggle() {
  const { toggleLanguage } = useLanguage()
  const { t } = useTranslations()

  return (
    <Button variant="ghost" onClick={toggleLanguage} className="px-2 text-sm gold-gradient">
      {t("language")}
    </Button>
  )
}
