"use client"
import { motion } from "framer-motion"
import { Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

export function SwapButton({ product, tokenId, isSwapping, onSwap, t }) {
  if (product.status_swap !== "available" || product.user_id === tokenId) {
    return null
  }

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Button 
        className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary via-primary to-secondary2 hover:from-primary/90 hover:via-primary hover:to-secondary2/90 relative overflow-hidden group rounded-xl sm:rounded-2xl"
        onClick={onSwap}
        disabled={isSwapping}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
        {isSwapping ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            {t("processing") || "Processing..."}
          </>
        ) : (
          <>
            <Repeat className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
            {t("makeSwap") || t("swap") || "Make a Swap"}
          </>
        )}
      </Button>
    </motion.div>
  )
}
