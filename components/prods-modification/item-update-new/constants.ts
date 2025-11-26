import type { Variants } from "framer-motion"

/**
 * Animation variants for Framer Motion
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

export const imageUploadVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    },
  },
}

export const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 167, 93, 0.2)",
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

/**
 * File upload constraints
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_IMAGES = 6

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/*",
  "video/mp4",
  "video/mov",
  "video/avi",
  "video/mkv",
  "video/webm",
  "video/flv",
  "video/wmv",
  "video/mpeg",
  "video/mpg",
  "video/m4v",
  "video/m4a",
  "video/m4b",
  "video/m4p",
  "video/*",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/m4a",
  "audio/m4b",
  "audio/m4p",
  "audio/*",
]

/**
 * AI System Prompt for updates
 */
export const AI_SYSTEM_PROMPT =
  "You are an expert product appraiser and translator that analyzes both text descriptions and visual images to provide accurate price estimations. You can identify products, assess their condition from photos, and provide realistic market valuations. You also provide high-quality translations between Arabic and English. For location translations, use the actual city and street names provided by the user, not generic terms like 'Current Location'. IMPORTANT: Respond ONLY with valid JSON - no markdown, no code blocks, no extra text, just the JSON object."
