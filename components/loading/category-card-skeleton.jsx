"use client"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

const pulseVariants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export function CategoryCardSkeleton() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 pr-4 pl-2 rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-sm"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Image skeleton - circular */}
      <motion.div 
        className="relative aspect-square w-[70px] md:w-[80px] overflow-hidden rounded-full"
        variants={itemVariants}
      >
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="w-full h-full rounded-full" />
        </motion.div>
      </motion.div>

      {/* Text skeleton */}
      <motion.div variants={itemVariants}>
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="h-4 w-16 md:w-20 rounded" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
