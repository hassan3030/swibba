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
 * Modern CategoryCard component with clean design matching brands page
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
  const [hasError, setHasError] = useState(false)
  const { language } = useLanguage()

  // Memoize the display name to prevent unnecessary recalculations
  const displayName = useMemo(() => {
    if (!translations || translations.length === 0) return name
    
    // Helper function to safely get language code
    const getLanguageCode = (t) => {
      if (!t.languages_code) return null
      // If it's an object with a code property
      if (typeof t.languages_code === 'object' && t.languages_code.code) {
        return t.languages_code.code
      }
      // If it's a string
      if (typeof t.languages_code === 'string') {
        return t.languages_code
      }
      return null
    }
    
    // Try exact match first
    let translation = translations.find(t => {
      const code = getLanguageCode(t)
      return code === language
    })
    
    // If not found and language is "ar", try variations like "ar-SA"
    if (!translation && language === "ar") {
      translation = translations.find(t => {
        const code = getLanguageCode(t)
        return code && code.startsWith('ar')
      })
    }
    
    // If not found and language is "en", try variations like "en-US"
    if (!translation && language === "en") {
      translation = translations.find(t => {
        const code = getLanguageCode(t)
        return code && code.startsWith('en')
      })
    }
    
    return translation?.name || name
  }, [language, translations, name])

  // Use useCallback to memoize event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setHasError(true)
    if (src && src.endsWith(".webp")) {
      const fallback = src.replace("/categories/", "").replace(".webp", ".jpg")
      setSrc(fallback)
    }
  }, [src])

  return (
    <Link 
      href={`categories/${name}`} 
      className="group block h-full"
      aria-label={`Browse ${displayName} category`}
    >
      <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full p-5">
          {/* Image container with subtle backdrop */}
          <div className="relative w-full aspect-square max-w-[120px] mb-4 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center h-full shadow-inner">
              {/* Loading placeholder */}
              {!imageLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
                </div>
              )}
              
              <div className="relative w-full h-full">
                <Image
                  src={hasError ? "/placeholder.svg?height=200&width=200" : (src || "/placeholder.svg?height=200&width=200")}
                  alt={displayName}
                  fill
                  loading="lazy"
                  onLoad={handleImageLoad}
                  className={`object-contain drop-shadow-sm transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  sizes="120px"
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>
          
          {/* Category name with modern typography */}
          <div className="w-full text-center">
            <h3 className="font-bold text-sm capitalize md:text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {displayName}
            </h3>
            {/* Animated underline */}
            <div className="mt-2 h-0.5 w-0 group-hover:w-12 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-300" />
          </div>
        </div>
        
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </Link>
  )
}