"use client"
import { motion } from "framer-motion"
import { SwibbaProductCardSkeleton } from "./swibba-product-card-skeleton"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
}

export function ItemsListSkeleton({ count = 8 }) {
  return (
    <motion.div
      className="flex flex-row gap-4 justify-center flex-wrap max-w-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          variants={itemVariants}
          custom={index}
        >
          <SwibbaProductCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  )
}
