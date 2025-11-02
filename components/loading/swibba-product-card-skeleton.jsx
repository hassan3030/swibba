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

export function SwibbaProductCardSkeleton() {
  return (
    <motion.div
      className="group relative flex lg:w-[210px] w-[150px] flex-col overflow-hidden rounded-md border bg-muted/10"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Image skeleton */}
      <motion.div className="relative aspect-square overflow-hidden" variants={itemVariants}>
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="w-full h-full absolute top-0 left-0" />
        </motion.div>
      </motion.div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-3">
        <motion.div variants={itemVariants}>
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-5 w-3/4 mb-2" />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-4 w-1/2 mb-2" />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-6 w-1/3 mb-4" />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-8 w-full rounded" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
