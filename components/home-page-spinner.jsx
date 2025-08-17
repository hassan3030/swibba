"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-provider"
import { useTranslations } from "@/lib/use-translations"

/**
 * A specialized loading spinner for the home page with brand-themed animation
 */
const HomePageSpinner = () => {
  const { theme } = useTheme()
  const { t } = useTranslations()
  
  // Animation variants for the logo parts
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }
  
  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      }
    },
  }
  
  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }
  
  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.5,
      }
    },
  }
  
  const dotVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "loop",
      }
    },
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center p-8 rounded-xl bg-background/60 shadow-lg border border-primary/20"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Animated logo/spinner */}
        <div className="relative mb-8">
          <motion.div 
            className="w-28 h-28 rounded-full bg-gradient-to-r from-primary to-primary/70"
            variants={circleVariants}
            animate="animate"
            initial="initial"
          />
          <motion.div 
            className="absolute inset-0 w-28 h-28 rounded-full bg-primary/30"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div 
            className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white"
            variants={textVariants}
          >
           SWIBBA
          </motion.div>
          
          {/* Orbiting particles */}
          <motion.div 
            className="absolute w-4 h-4 rounded-full bg-yellow-400"
            animate={{
              x: [0, 30, 0, -30, 0],
              y: [-30, 0, 30, 0, -30],
              scale: [1, 1.2, 1, 0.8, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: '50%', left: '50%', marginTop: '-2px', marginLeft: '-2px' }}
          />
          
          <motion.div 
            className="absolute w-3 h-3 rounded-full bg-blue-400"
            animate={{
              x: [0, -20, 0, 20, 0],
              y: [20, 0, -20, 0, 20],
              scale: [0.8, 1, 0.8],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5
            }}
            style={{ top: '50%', left: '50%', marginTop: '-1.5px', marginLeft: '-1.5px' }}
          />
        </div>
        
        {/* Loading text with animated dots */}
        <motion.div 
          className="flex items-center text-xl font-medium text-foreground"
          variants={textVariants}
        >
          <span>{t("loading") || "Loading"}</span>
          <motion.span variants={dotVariants} className="ml-1">.</motion.span>
          <motion.span variants={dotVariants} className="ml-1" style={{ animationDelay: "0.2s" }}>.</motion.span>
          <motion.span variants={dotVariants} className="ml-1" style={{ animationDelay: "0.4s" }}>.</motion.span>
        </motion.div>
        
        <motion.p 
          className="mt-4 text-sm text-muted-foreground max-w-xs text-center"
          variants={textVariants}
        >
          {t("preparingAmazingItems") || "Preparing amazing items for you"}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default HomePageSpinner