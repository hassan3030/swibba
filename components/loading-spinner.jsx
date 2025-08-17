"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-provider"
import { useTranslations } from "@/lib/use-translations"

const spinTransition = {
  loop: Infinity,
  ease: "linear",
  duration: 1
}

/**
 * LoadingSpinner component that can be used in different contexts
 * @param {Object} props - Component props
 * @param {boolean} props.fullPage - Whether to display as a full page overlay
 * @param {string} props.size - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} props.text - Text to display below the spinner
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  fullPage = false, 
  size = "md", 
  text, 
  className = ""
}) => {
  const { theme } = useTheme()
  const { t } = useTranslations()
  
  // Determine spinner size based on prop
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  }
  
  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
  
  // If fullPage is true, render with a full-page overlay
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center">
          {spinnerContent}
          <p className="mt-4 text-center text-muted-foreground">
            {text || t("loading") || "Loading..."}
          </p>
        </div>
      </div>
    )
  }
  
  // Otherwise, render as an inline component
  return spinnerContent
}

export default LoadingSpinner