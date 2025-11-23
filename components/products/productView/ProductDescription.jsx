"use client"
import { motion } from "framer-motion"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export function ProductDescription({ product, isRTL, t }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border"
    >
      <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
        <span>{t("aboutProduct") || t("description") || "About this item"}</span>
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
        {(!isRTL ? product.translations[0]?.description : product.translations[1]?.description) || product.description}
      </p>
    </motion.div>
  )
}
