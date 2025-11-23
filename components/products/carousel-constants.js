/**
 * Carousel configuration constants
 * @module carousel-constants
 */

export const SCROLL_CONFIG = {
  MOBILE_BREAKPOINT: 640,
  DEFAULT_CARD_WIDTH: 300,
  MOBILE_CARDS_TO_SCROLL: 1,
  DESKTOP_CARDS_TO_SCROLL: 2,
  SCROLL_THRESHOLD: 5, // Pixels threshold for scroll detection (increased for better edge detection)
  MOBILE_PEEK_PERCENTAGE: 0.15, // Show 15% of adjacent cards on mobile
}

export const ANIMATION_CONFIG = {
  container: {
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
  },
  header: {
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
  },
  button: {
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
  },
  underline: {
    initial: { width: 0 },
    animate: { width: 48 },
    transition: { delay: 0.3, duration: 0.6 },
  },
}

