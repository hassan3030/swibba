"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"

export function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
  const { t } = useTranslations()

  return (
    <motion.div
      className="relative flex-1"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
      <Input
        placeholder={t("searchItems") || "Search items..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="pl-11 h-12 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 hover:border-primary/50 focus:ring-primary/20 focus:border-primary/50 rounded-xl shadow-sm"
      />
    </motion.div>
  )
}
