import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Navigation button component for carousel
 */
function NavigationButton({ direction, onClick, buttonVariants, icon: Icon, isRTL }) {
  // RTL-aware positioning
  const positionClasses = isRTL
    ? direction === "left"
      ? "right-0 md:right-0 md:-right-4 lg:-right-6" // In RTL, left arrow goes to right side
      : "left-0 md:left-0 md:-left-4 lg:-left-6"
    : direction === "left"
      ? "left-0 md:left-0 md:-left-4 lg:-left-6"
      : "right-0 md:right-0 md:-right-4 lg:-right-6"
  const hoverDirection = direction === "left" ? -2 : 2

  return (
    <motion.div
      className={`absolute ${positionClasses} top-1/2 md:top-1/2 z-30 -translate-y-1/2`}
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      whileHover="hover"
      whileTap="tap"
    >
      <Button
        variant="ghost"
        size="icon"
        className="group h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 border border-gray-600/50 dark:border-gray-400/50 transition-all duration-300"
        onClick={onClick}
        aria-label={`Scroll ${direction}`}
      >
        <motion.div
          whileHover={{ x: hoverDirection }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        >
          <Icon
            className=" h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300"
            strokeWidth={2.5}
          />
        </motion.div>
        <span className="sr-only">Scroll {direction}</span>
      </Button>
    </motion.div>
  )
}

/**
 * Carousel navigation buttons component (left and right arrows)
 * In RTL: icons are swapped so arrows point in correct visual direction
 */
export function CarouselNavigation({ canScrollLeft, canScrollRight, onScroll, buttonVariants, isRTL }) {
  return (
    <>
      {/* Left scroll button */}
      <AnimatePresence>
        {canScrollLeft && (
          <NavigationButton
            direction="left"
            onClick={() => onScroll("left")}
            buttonVariants={buttonVariants}
            icon={isRTL ? ChevronRight : ChevronLeft}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>

      {/* Right scroll button */}
      <AnimatePresence>
        {canScrollRight && (
          <NavigationButton
            direction="right"
            onClick={() => onScroll("right")}
            buttonVariants={buttonVariants}
            icon={isRTL ? ChevronLeft : ChevronRight}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>
    </>
  )
}
