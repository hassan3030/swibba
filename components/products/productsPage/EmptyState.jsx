"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"

export function EmptyState({ showClearButton = false, onClearFilters = null }) {
  const router = useRouter()
  const { t } = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
      key="empty"
    >
      {/* Empty State Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-full">
            <svg
              className="w-24 h-24 text-primary/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Empty State Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-3 max-w-md"
      >
        <h3 className="text-2xl font-bold text-foreground">
          {t("noProductsAvailable") || "No Products Available"}
        </h3>
        <p className="text-base text-muted-foreground">
          {t("noProductsFound") || "We couldn't find any products matching your criteria."}
        </p>
        <p className="text-sm text-muted-foreground/80">
          {t("tryAdjustingFilters") || "Try adjusting your filters or search terms to see more results."}
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-col sm:flex-row gap-3"
      >
        {showClearButton && onClearFilters && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onClearFilters}
              variant="default"
              size="lg"
              className="px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              {t("browseAllProducts") || "Browse All Products"}
            </Button>
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => router.push("/")}
            variant={showClearButton ? "outline" : "default"}
            size="lg"
            className="px-6 py-3 rounded-full font-medium transition-all duration-300"
          >
            {t("goBack") || "Go Back Home"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
