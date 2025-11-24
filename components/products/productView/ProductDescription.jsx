"use client"
import { motion } from "framer-motion"
import { useState } from "react"

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
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_CHARS = 490
  
  const description = (!isRTL ? product.translations[0]?.description : product.translations[1]?.description) || product.description || ""
  const shouldTruncate = description.length > MAX_CHARS
  const displayText = isExpanded ? description : description.slice(0, MAX_CHARS)
  
  return (
    <motion.div
      variants={fadeInUp}
      className="dark:bg-gray-950  rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border"
    >
      {/* <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
        <span>{t("aboutProduct") || t("description") || "About this item"}</span>
      </h3> */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {displayText}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 ml-1 font-bold text-base transition-colors"
          >
            ...
          </button>
        )}
      </p>
    </motion.div>
  )
}
