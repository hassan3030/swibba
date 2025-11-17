"use client"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

// Animation variants for skeleton loading states
const skeletonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
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
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

const shimmerVariants = {
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

/**
 * Modern skeleton loader matching the CategoryCard design
 */
export function CategoryCardSkeleton() {
  return (
    <motion.div
      className="relative flex flex-col items-center gap-4 p-5 rounded-3xl bg-background/40 backdrop-blur-xl border border-primary/20 shadow-xl overflow-hidden"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)/0.15) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        variants={shimmerVariants}
        animate="shimmer"
      />

      {/* Image skeleton - rounded rectangle matching new design */}
      <motion.div 
        className="relative aspect-square w-[90px] md:w-[100px] overflow-hidden rounded-2xl"
        variants={itemVariants}
      >
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="w-full h-full rounded-2xl bg-background/60 backdrop-blur-sm" />
        </motion.div>
      </motion.div>

      {/* Text skeleton */}
      <motion.div 
        className="w-full space-y-2 px-2"
        variants={itemVariants}
      >
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="h-4 w-3/4 mx-auto rounded-md bg-muted/50" />
        </motion.div>
        {/* Subtle underline skeleton */}
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="h-[2px] w-1/3 mx-auto rounded-full bg-muted/30" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
