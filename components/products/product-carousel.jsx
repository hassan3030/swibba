"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  hover: {
    scale: 1.1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  tap: { scale: 0.9 },
}

export function ProductCarousel({ title, viewAllHref, viewAllLabel, children }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const containerRef = useRef(null)
  const { isRTL } = useLanguage()

  const checkScrollability = () => {
    const container = containerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    if (isRTL) {
      setCanScrollLeft(scrollLeft < 0)
      setCanScrollRight(Math.abs(scrollLeft) < scrollWidth - clientWidth - 1)
    } else {
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [isRTL])

  const scroll = (direction) => {
    const container = containerRef.current
    if (!container) return

    const scrollAmount = 320
    const currentScroll = container.scrollLeft

    if (isRTL) {
      container.scrollTo({
        left: direction === "right" ? currentScroll + scrollAmount : currentScroll - scrollAmount,
        behavior: "smooth",
      })
    } else {
      container.scrollTo({
        left: direction === "right" ? currentScroll + scrollAmount : currentScroll - scrollAmount,
        behavior: "smooth",
      })
    }

    setTimeout(checkScrollability, 300)
  }

  return (
    
    <motion.div className="relative" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="mb-4 flex items-center justify-between" variants={headerVariants}>
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r  from-gray-900 to-gray-600 text-secondary/90 bg-clip-text "
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {title}
        </motion.h2>
        {viewAllHref && (
          <motion.a
            href={viewAllHref}
            className="text-sm font-medium text-primary hover:scale-105 transition-all duration-200"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {viewAllLabel}
          </motion.a>
        )}
      </motion.div>

      <div className="relative">
        {/* Left scroll button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full hover:rounded-full"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border bg-background shadow-lg backdrop-blur-sm"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Scroll left</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products container */}
        <motion.div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide scroll-smooth"
          onScroll={checkScrollability}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {children}
        </motion.div>

        {/* Right scroll button */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full " 
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border bg-background shadow-lg backdrop-blur-sm"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicators */}
      {/* <motion.div
        className="flex justify-center mt-2 gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-1 w-8 bg-gray-200 rounded-full overflow-hidden"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: i === 0 ? "100%" : "30%" }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            />
          </motion.div>
        ))}
      </motion.div> */}
    </motion.div>
  )
}
