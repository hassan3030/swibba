import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

/**
 * Carousel header component with title and optional view all link
 */
export function CarouselHeader({ title, viewAllHref, viewAllLabel, headerVariants }) {
  return (
    <motion.div className="mb-6 flex items-center justify-between" variants={headerVariants}>
      <motion.div className="flex flex-col gap-2">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-primary"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {title}
        </motion.h2>
        <motion.div
          className="h-1 w-12 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </motion.div>
      {viewAllHref && (
        <motion.a
          href={viewAllHref}
          className="group flex items-center gap-2 text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-200"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      )}
    </motion.div>
  )
}
