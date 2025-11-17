"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
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
  hidden: { opacity: 0, scale: 0.3, x: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
  tap: { 
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
}

export function ProductCarousel({ title, viewAllHref, viewAllLabel, children }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)
  const containerRef = useRef(null)
  const { isRTL } = useLanguage()

  const checkScrollability = useCallback(() => {
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
  }, [isRTL])

  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
    }
    return () => {
      window.removeEventListener("resize", checkScrollability)
      if (container) {
        container.removeEventListener("scroll", checkScrollability)
      }
    }
  }, [isRTL, checkScrollability])

  const scroll = (direction) => {
    const container = containerRef.current
    if (!container) return

    const cardWidth = 300 // Approximate card width including gap
    const scrollAmount = cardWidth * 2 // Scroll 2 cards at a time
    const currentScroll = container.scrollLeft

    // For RTL, scrollLeft is negative, so we need to handle it differently
    if (isRTL) {
      // In RTL: reverse the scroll direction
      const newPosition = direction === "right" 
        ? currentScroll - scrollAmount  // Right arrow scrolls left (more negative)
        : currentScroll + scrollAmount  // Left arrow scrolls right (less negative)
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
    } else {
      // In LTR: left button scrolls left (negative direction), right button scrolls right (positive direction)
      const newPosition = direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
    }
  }

  // Drag to scroll functionality
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeftStart(containerRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeftStart - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    
    <motion.div className="relative py-4" variants={containerVariants} initial="hidden" animate="visible">
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

      <div className="relative group/carousel">
        {/* Left scroll button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              className="absolute -left-2 md:-left-4 top-1/2 z-20 -translate-y-1/2"
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
                className="group h-12 w-12 rounded-full border-2 border-primary/30 dark:border-primary/50 bg-white dark:bg-gray-900 shadow-2xl hover:shadow-primary/30 hover:shadow-[0_8px_30px_rgb(0,167,93,0.3)] backdrop-blur-lg hover:bg-primary hover:border-primary transition-all duration-300"
                onClick={() => scroll("left")}
              >
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [-3, 3, -3] }}
                  whileHover={{ x: -3 }}
                  transition={{ 
                    x: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }}
                >
                  <ChevronLeft style={{ width: '28px', height: '28px' }} strokeWidth={3} className="text-primary group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <span className="sr-only">Scroll left</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products container */}
        <motion.div
          ref={containerRef}
          className={`flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide scroll-smooth ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
              className="absolute -right-2 md:-right-4 top-1/2 z-20 -translate-y-1/2" 
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
                className="group h-12 w-12 rounded-full border-2 border-primary/30 dark:border-primary/50 bg-white dark:bg-gray-900 shadow-2xl hover:shadow-primary/30 hover:shadow-[0_8px_30px_rgb(0,167,93,0.3)] backdrop-blur-lg hover:bg-primary hover:border-primary transition-all duration-300"
                onClick={() => scroll("right")}
              >
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [-3, 3, -3] }}
                  whileHover={{ x: 3 }}
                  transition={{ 
                    x: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }}
                >
                  <ChevronRight style={{ width: '28px', height: '28px' }} strokeWidth={3} className="text-primary group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <span className="sr-only">Scroll right</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Gradient overlays for visual scroll indication */}
        <motion.div
          className="absolute left-0 top-0 bottom-6 w-8 md:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: canScrollLeft ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute right-0 top-0 bottom-6 w-8 md:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: canScrollRight ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

    </motion.div>
  )
}
