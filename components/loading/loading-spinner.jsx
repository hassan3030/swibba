"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-provider"
import { useTranslations } from "@/lib/use-translations"
import Image from "next/image"

const spinTransition = {
  loop: Infinity,
  ease: "linear",
  duration: 1
}

/**
 * Simple universal loading spinner component
 * @param {Object} props - Component props
 * @param {boolean} props.fullPage - Whether to display as a full page overlay
 * @param {string} props.size - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} props.text - Text to display below the spinner
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.branded - Whether to show SWIBBA branding (only for home page)
 */
const LoadingSpinner = ({ 
  fullPage = false, 
  size = "md", 
  text, 
  className = "",
  branded = false
}) => {
  const { theme } = useTheme()
  const { t } = useTranslations()
  
  // Determine spinner size based on prop
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  }
  
  // If branded spinner for home page, return SWIBBA branded version
  if (branded && fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center p-8 rounded-xl shadow-lg w-full h-full justify-center">
          {/* Animated SWIBBA logo */}
          <div className="relative mb-6 ">
            <motion.div 
              className="w-30 h-30 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.15, 1],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
               
              }}
            >
              {/* <span className="text-white font-bold text-lg">SWIBBA</span> */}
              <Image src="/logo.png" alt={t('swibbaLogo')} width={100} height={100} />
            </motion.div>
          </div>
          
          {/* Loading text */}
          <motion.div
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

          </motion.div>
        </div>
      </div>
    )
  }
  
  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-white border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
  
  // If fullPage is true, render with a full-page overlay
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center ">
        <div className="bg-background/10 p-6 rounded-lg shadow-lg flex flex-col items-center w-full h-full justify-center">
          {spinnerContent}
             {/* Loading text */}
             <motion.div
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

          </motion.div>
        </div>
      </div>
    )
  }
  
  // Otherwise, render as an inline component
  return spinnerContent
}

export default LoadingSpinner