"use client"

import { useLanguage } from "./language-provider"
import { translations } from "./translations"

export function useTranslations() {
  const { language } = useLanguage()

  const t = (key) => {
    return translations[language][key] || key
  }

  return { t }
}
