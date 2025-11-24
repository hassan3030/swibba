"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-provider"
import { useCarouselScroll } from "@/hooks/use-carousel-scroll"
import { useCarouselDrag } from "@/hooks/use-carousel-drag"
import { CarouselHeader } from "./carousel-header"
import { CarouselNavigation } from "./carousel-navigation"
import { ANIMATION_CONFIG } from "./carousel-constants"

/**
 * ProductCarousel Component
 * A responsive carousel with drag support and navigation arrows
 * Optimized for mobile with centered navigation buttons
 * 
 * @param {string} title - Carousel section title
 * @param {string} viewAllHref - Link for "View All" button
 * @param {string} viewAllLabel - Label text for "View All" button
 * @param {React.ReactNode} children - Product cards to display
 */
export function ProductCarousel({ title, viewAllHref, viewAllLabel, children }) {
  const containerRef = useRef(null)
  const { isRTL } = useLanguage()

  // Custom hooks for carousel functionality
  const { canScrollLeft, canScrollRight, scroll } = useCarouselScroll(
    containerRef,
    isRTL
  )
  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } =
    useCarouselDrag(containerRef)

  return (
    <motion.div
      className="relative py-4 z-10"
      variants={ANIMATION_CONFIG.container}
      initial="hidden"
      animate="visible"
    >
      <CarouselHeader
        title={title}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
        headerVariants={ANIMATION_CONFIG.header}
      />

      <div className="relative group/carousel">
        <CarouselNavigation
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScroll={scroll}
          buttonVariants={ANIMATION_CONFIG.button}
          isRTL={isRTL}
        />

        {/* Products container */}
        <motion.div
          ref={containerRef}
          dir={isRTL ? "rtl" : "ltr"}
          className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3 md:gap-6 overflow-x-auto pb-6 pt-2 px-[5vw] md:px-0 scrollbar-hide scroll-smooth snap-x snap-mandatory ${isRTL ? 'md:justify-end' : 'md:justify-start'} ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
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
      </div>
    </motion.div>
  )
}
