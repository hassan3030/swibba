"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { COLORS } from "@/lib/theme-constants"

export function ThemePreview() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  const colorSamples = [
    {
      name: "Background",
      color: isDark ? COLORS.dark.surface : "#FFFFFF",
      textColor: isDark ? COLORS.dark.text : "#000000",
    },
    { name: "Card", color: isDark ? COLORS.dark.card : "#F8F9FA", textColor: isDark ? COLORS.dark.text : "#000000" },
    {
      name: "Accent",
      color: isDark ? COLORS.dark.accent : COLORS.hex.primaryYellow,
      textColor: isDark ? COLORS.dark.surface : "#000000",
    },
    { name: "Text", color: isDark ? COLORS.dark.text : "#000000", textColor: isDark ? COLORS.dark.surface : "#FFFFFF" },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Theme: {isDark ? "Dark" : "Light"}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {colorSamples.map((sample) => (
            <div
              key={sample.name}
              className="p-4 rounded-md flex items-center justify-center h-20"
              style={{ backgroundColor: sample.color, color: sample.textColor }}
            >
              {sample.name}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button className="w-full">Primary Button</Button>
          <Button variant="secondary" className="w-full">
            Secondary Button
          </Button>
          <Button variant="outline" className="w-full">
            Outline Button
          </Button>
          <Button variant="ghost" className="w-full">
            Ghost Button
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
