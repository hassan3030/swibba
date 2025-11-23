"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"

export function EmptyState() {
  const router = useRouter()
  const { t } = useTranslations()

  return (
    <motion.div
      className="flex h-40 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      key="empty"
    >
      <motion.p
        className="text-lg font-medium"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t("noItemsFound") || "No items found"}
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button onClick={() => router.push("/")}>
          {t("goBack") || "Go Back"}
        </Button>
      </motion.div>
    </motion.div>
  )
}
