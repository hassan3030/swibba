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
      className="group relative flex h-full lg:w-[280px] md:w-[240px] w-[165px] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-muted/10 shadow-sm"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Image skeleton */}
      <motion.div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800" variants={itemVariants}>
        <motion.div variants={pulseVariants} animate="pulse">
          <Skeleton className="w-full h-full absolute top-0 left-0" />
        </motion.div>
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        
        {/* Badge skeleton */}
        <motion.div className="absolute left-3 top-3" variants={itemVariants}>
          <Skeleton className="h-6 w-16 rounded-full" />
        </motion.div>
        
        {/* Heart skeleton */}
        <motion.div className="absolute right-3 top-3" variants={itemVariants}>
          <Skeleton className="h-10 w-10 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Title skeleton */}
        <motion.div variants={itemVariants} className="space-y-2">
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-4 w-full rounded" />
          </motion.div>
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-4 w-3/4 rounded" />
          </motion.div>
        </motion.div>

        {/* Price skeleton */}
        <motion.div variants={itemVariants} className="mt-1">
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-7 w-24 rounded" />
          </motion.div>
        </motion.div>

        {/* Date and location skeleton */}
        <motion.div variants={itemVariants} className="space-y-2">
          <motion.div variants={pulseVariants} animate="pulse" className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
          </motion.div>
          <motion.div variants={pulseVariants} animate="pulse" className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-32 rounded" />
          </motion.div>
        </motion.div>

        {/* Button skeleton */}
        <motion.div variants={itemVariants} className="mt-auto pt-2">
          <motion.div variants={pulseVariants} animate="pulse">
            <Skeleton className="h-10 w-full rounded-xl" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
