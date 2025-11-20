"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PreferencesTab({ t, isRTL }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
     

            <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            
            <div className={isRTL ? 'text-right w-full' : ''}>
            <CardTitle className={`text-2xl font-bold text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("preferences") || "Preferences"}
          </CardTitle>
          <CardDescription className={`text-base mt-2 text-muted-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Customizeyourexperience") || "Customize your experience on the platform"}
          </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-background hover:bg-accent/5 transition-colors">
              <div>
                <h3 className={`font-semibold text-base ${isRTL ? 'force-rtl' : ''}`}>
                  {t("DarkMode") || "Dark Mode"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Customizeyourexperience") || "Toggle between light and dark themes"}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-background hover:bg-accent/5 transition-colors">
              <div>
                <h3 className={`font-semibold text-base ${isRTL ? 'force-rtl' : ''}`}>
                  {t("changeLanguage") || "Language"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("changeLanguageDescription") || "Change the language of the platform"}
                </p>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
