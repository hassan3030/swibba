"use client"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/use-translations"

const SwapLoadingState = ({ message }) => {
  const { t } = useTranslations()
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-foreground/70">{message || t("LoadingSwapPage") || "Loading swap page..."}</p>
      </motion.div>
    </div>
  )
}

export default SwapLoadingState
