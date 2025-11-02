"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-provider"
import { useTranslations } from "@/lib/use-translations"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslations()
  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full",
        "hover:bg-primary/80",
        "transition-colors duration-200",
        isDark ? "text-primary" : "text-gray-700",
      )}
      title={isDark ? t("lightMode") : t("darkMode")}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200 hover:-rotate-12" />
      )}
      <span className="sr-only">{isDark ? t("lightMode") : t("darkMode")}</span>
    </Button>
  )
}
