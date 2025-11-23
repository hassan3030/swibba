import { useState, useEffect, useCallback } from "react"
import { SCROLL_CONFIG } from "@/components/products/carousel-constants"

/**
 * Custom hook for managing carousel scroll state and logic
 * @param {Object} containerRef - React ref to the scroll container
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @returns {Object} Scroll state and control functions
 */
export function useCarouselScroll(containerRef, isRTL) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkScrollability = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Count actual DOM children
    const childrenCount = container.children.length
    
    // Determine minimum items based on screen size
    const isMobile = window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT
    const minItems = isMobile ? 2 : 4

    // Hide arrows if less than minimum items
    if (childrenCount < minItems) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const { scrollLeft, scrollWidth, clientWidth } = container

    // Check if content is scrollable
    const isScrollable = scrollWidth > clientWidth + 1
    if (!isScrollable) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    if (isRTL) {
      // RTL: scrollLeft is 0 or positive when scrolled left, negative when at start
      // Most browsers: scrollLeft starts at 0 and goes negative as you scroll right
      const maxScrollLeft = scrollWidth - clientWidth
      const atStart = Math.abs(scrollLeft) <= SCROLL_CONFIG.SCROLL_THRESHOLD
      const atEnd = Math.abs(scrollLeft) >= maxScrollLeft - SCROLL_CONFIG.SCROLL_THRESHOLD
      
      setCanScrollLeft(!atEnd)   // Can scroll left if not at end
      setCanScrollRight(!atStart) // Can scroll right if not at start
    } else {
      // LTR: Standard scroll behavior
      const atStart = Math.abs(scrollLeft) <= SCROLL_CONFIG.SCROLL_THRESHOLD
      const atEnd = Math.abs(scrollLeft - (scrollWidth - clientWidth)) <= SCROLL_CONFIG.SCROLL_THRESHOLD
      
      setCanScrollLeft(!atStart)  // Can scroll left if not at start
      setCanScrollRight(!atEnd)   // Can scroll right if not at end
    }
    
    if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [isRTL, containerRef, isInitialized])

  useEffect(() => {
    // Initial check - set initial scroll position for RTL
    if (containerRef.current && isRTL && !isInitialized) {
      // For RTL, scroll to start (which is the right side)
      containerRef.current.scrollLeft = 0
    }
    
    // Run initial check immediately
    checkScrollability()
    
    // Delayed checks to ensure DOM is fully rendered
    const timeoutId1 = setTimeout(() => {
      checkScrollability()
    }, 50)
    
    const timeoutId2 = setTimeout(() => {
      checkScrollability()
    }, 150)

    window.addEventListener("resize", checkScrollability)
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
    }
    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      window.removeEventListener("resize", checkScrollability)
      if (container) {
        container.removeEventListener("scroll", checkScrollability)
      }
    }
  }, [checkScrollability, isRTL, isInitialized])

  const scroll = useCallback(
    (direction) => {
      const container = containerRef.current
      if (!container) return

      const isMobile = window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT
      // On mobile: account for centered card (70vw) + gap
      const cardWidth = isMobile 
        ? window.innerWidth * 0.7 + 16 // 70vw + gap
        : SCROLL_CONFIG.DEFAULT_CARD_WIDTH
      const cardsToScroll = isMobile
        ? SCROLL_CONFIG.MOBILE_CARDS_TO_SCROLL
        : SCROLL_CONFIG.DESKTOP_CARDS_TO_SCROLL
      const scrollAmount = cardWidth * cardsToScroll
      const currentScroll = container.scrollLeft

      if (isRTL) {
        // In RTL, we need to scroll in opposite direction
        const newPosition =
          direction === "right" ? currentScroll + scrollAmount : currentScroll - scrollAmount

        container.scrollTo({
          left: newPosition,
          behavior: "smooth",
        })
      } else {
        const newPosition =
          direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

        container.scrollTo({
          left: newPosition,
          behavior: "smooth",
        })
      }
    },
    [containerRef, isRTL]
  )

  return {
    canScrollLeft,
    canScrollRight,
    scroll,
  }
}
