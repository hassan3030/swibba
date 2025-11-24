"use client"
import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"

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

export function ProductPrice({ product, t }) {
  return (
    <motion.div
      variants={scaleIn}
      className=" bg-gradient-to-br from-background via-primary/10 to-background/20 rounded-2xl sm:rounded-3xl p-4  border-2 border-primary/10 shadow-sm"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          {/* <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("price")}</span> */}
          <div className="flex items-baseline gap-2">
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary2 mb-1 sm:mb-2" />
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary2 tracking-tighter"
            >
              {Number(product.price).toLocaleString('en-US')}
            </motion.span>
            <span className="text-xl sm:text-2xl font-bold text-secondary2/70 mb-1 sm:mb-2">{t("le")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
