"use client"

import Image from "next/image"
import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles"

// Animation variants following best practices - defined outside component
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const shimmerVariants = {
  initial: { x: "-100%" },
  hover: {
    x: "100%",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

/**
 * Modern CategoryCard component with glassmorphism design
 * @param {Object} props - Component props
 * @param {string} props.name - Category name
 * @param {string} props.imageSrc - Image source URL
 * @param {Array} props.translations - Array of translations
 * @param {boolean} props.showCategoryLevels - Show category levels (deprecated)
 * @param {Object} props.catLevels - Category levels data (deprecated)
 */
export function CategoryCard({ name, imageSrc, translations = [], showCategoryLevels = false, catLevels }) {
  const { t } = useTranslations()
  const [src, setSrc] = useState(imageSrc)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { isRTL } = useLanguage()

  // Memoize the display name to prevent unnecessary recalculations
  const displayName = useMemo(() => {
    if (!translations || translations.length === 0) return name
    return isRTL ? translations[1]?.name || name : translations[0]?.name || name
  }, [isRTL, translations, name])

  // Use useCallback to memoize event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    if (src && src.endsWith(".webp")) {
      const fallback = src.replace("/categories/", "").replace(".webp", ".jpg")
      setSrc(fallback)
    }
  }, [src])

  return (
    <Link 
      href={`categories/${name}`} 
      className="group block"
      aria-label={`Browse ${displayName} category`}
    >
      <motion.div
        className="relative flex flex-col items-center justify-between gap-4 p-5 h-[220px] md:h-[240px] rounded-3xl bg-background/20 backdrop-blur-xl border border-primary/20 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300 overflow-hidden will-change-transform"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-primary/[0.05] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none"
          variants={shimmerVariants}
          initial="initial"
          whileHover="hover"
        />

        {/* Image container with modern styling */}
        <div className="relative">
          <div
            className="relative aspect-square w-[110px] md:w-[120px] overflow-hidden rounded-2xl bg-background/60 backdrop-blur-sm shadow-lg border border-primary/20 group-hover:border-primary/50 group-hover:shadow-primary/20 transition-all duration-300"
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
              </div>
            )}
            
            {/* Category image */}
            <Image
              src={src || "/placeholder.svg?height=200&width=200"}
              alt={displayName}
              fill
              loading="lazy"
              onLoad={handleImageLoad}
              className={`object-cover transition-all duration-300 p-3 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 768px) 110px, 120px"
              onError={handleImageError}
            />

          </div>
        </div>

        {/* Category name with modern typography */}
        <motion.div className="relative z-10 text-center w-full px-2">
          <span className="text-sm md:text-base font-bold capitalize text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 block">
            {displayName}
          </span>
          
          {/* Animated underline with gradient */}
          <motion.div
            className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent mt-2 mx-auto rounded-full shadow-sm shadow-primary/50"
            initial={{ width: "0%", opacity: 0 }}
            whileHover={{ width: "60%", opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </Link>
  )
}