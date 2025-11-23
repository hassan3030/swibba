"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Filter, SlidersHorizontal } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"

export function FilterButton({ onClick, activeFiltersCount }) {
  const { t } = useTranslations()

  return (
    <motion.div 
      className="w-full sm:w-1/2"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Button
        variant="outline"
        onClick={onClick}
        className="hover:text-black dark:hover:text-white relative flex items-center justify-center gap-2 h-12 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5  w-full rounded-xl shadow-sm border-border/50 bg-background/50 backdrop-blur-sm group"
      >
        <SlidersHorizontal className="h-5 w-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-medium">{t("Filters")}</span>
        {activeFiltersCount > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {activeFiltersCount}
          </motion.span>
        )}
      </Button>
    </motion.div>
  )
}
