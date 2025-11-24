"use client"

import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoriesName } from "@/lib/data"
import { useTranslations } from "@/lib/use-translations"
import { Package } from "lucide-react"

export function CategoryFilter({ category, onCategoryChange }) {
  const { t } = useTranslations()

  return (
    <motion.div 
      className="w-full sm:w-auto sm:min-w-[200px]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-12 w-full transition-all duration-300 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 rounded-xl shadow-sm border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <SelectValue placeholder={t("showAllCategories") || "Show All Categories"} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-80 rounded-xl border-border/50 shadow-xl bg-popover text-popover-foreground">
          <SelectItem 
            key="all" 
            value="all" 
            className="capitalize hover:!bg-primary/10 focus:!bg-primary/10 rounded-lg my-1 text-foreground cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${category === "all" ? "bg-gradient-to-r from-primary to-primary/50" : "bg-muted-foreground/30"}`} />
              <span className="text-foreground">{t("allCategories") || "All Categories"}</span>
            </div>
          </SelectItem>
          {categoriesName.map((cat) => (
            <SelectItem 
              key={cat} 
              value={cat} 
              className="capitalize hover:!bg-primary/10 focus:!bg-primary/10 rounded-lg my-1 text-foreground cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${category === cat ? "bg-gradient-to-r from-primary to-primary/50" : "bg-muted-foreground/30"}`} />
                <span className="text-foreground">{t(cat) || cat}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  )
}
