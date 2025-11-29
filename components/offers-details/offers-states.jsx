"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ArrowRightLeft, Search, RefreshCcw } from "lucide-react"

export function OffersEmptyState({ t, onClearFilters, hasFilters = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 bg-gradient-to-b from-muted/30 to-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20">
          {/* Animated Icon Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="relative mb-6"
          >
            {/* Background Circles */}
            <div className="absolute inset-0 rounded-full bg-primary/5 scale-150" />
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-125" />
            
            {/* Main Icon Circle */}
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <ArrowRightLeft className="h-10 w-10 text-primary" />
            </div>
            
            {/* Decorative Package Icons */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"
            >
              <Package className="h-4 w-4 text-emerald-500" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-1 -left-3 h-7 w-7 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30"
            >
              <Package className="h-3.5 w-3.5 text-yellow-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-foreground mb-2"
          >
            {hasFilters 
              ? (t("noMatchingOffers") || "No matching offers")
              : (t("noOffersYet") || "No swap offers yet")}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground text-center max-w-sm mb-6 leading-relaxed"
          >
            {hasFilters 
              ? (t("tryAdjustingFilters") || "Try adjusting your filters or search criteria to find what you're looking for.")
              : (t("noOffersDescription") || "When you send or receive swap offers, they will appear here. Start swapping to see your history!")}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {hasFilters && onClearFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCcw className="h-4 w-4" />
                {t("clearFilters") || "Clear Filters"}
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => window.location.href = "/products"}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {t("browseProducts") || "Browse Products"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function OffersLoadingState({ t }) {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="rounded-xl border bg-card p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-6">
              <div className="space-y-1">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
              </div>
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
