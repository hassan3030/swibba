"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Users, ShieldCheck, Package, Sparkles } from "lucide-react"
import { getProducts } from "@/callAPI/products"
import { getAllUsers } from "@/callAPI/users"
import axios from "axios"
import { baseItemsURL, DIRECTUS_URL } from "@/callAPI/utiles"
import { useInView } from "react-intersection-observer"


// Enhanced Animation variants
const statsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4,
      },
    },
  }
  
  const statsItemVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12,
        duration: 0.8,
      },
    },
  }
  
  
const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }
  
  const shimmerVariants = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }
// Lazy-loaded Stats Section Component
const LazyStatsSection = ({ t , itemsCount, usersCount }) => {
    const [itemsCountNumber, setItemsCountNumber] = useState(0)
    const [usersCountNumber, setUsersCountNumber] = useState(0)
    const [displayItemsCount, setDisplayItemsCount] = useState(0)
    const [displayUsersCount, setDisplayUsersCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    const controls = useAnimation()
  
    // Counter animation effect
    useEffect(() => {
      if (hasLoaded && itemsCountNumber > 0) {
        const duration = 2000 // 2 seconds
        const steps = 60
        const increment = itemsCountNumber / steps
        let current = 0
        
        const timer = setInterval(() => {
          current += increment
          if (current >= itemsCountNumber) {
            setDisplayItemsCount(itemsCountNumber)
            clearInterval(timer)
          } else {
            setDisplayItemsCount(Math.floor(current))
          }
        }, duration / steps)
        
        return () => clearInterval(timer)
      }
    }, [itemsCountNumber, hasLoaded])

    useEffect(() => {
      if (hasLoaded && usersCountNumber > 0) {
        const duration = 2000 // 2 seconds
        const steps = 60
        const increment = usersCountNumber / steps
        let current = 0
        
        const timer = setInterval(() => {
          current += increment
          if (current >= usersCountNumber) {
            setDisplayUsersCount(usersCountNumber)
            clearInterval(timer)
          } else {
            setDisplayUsersCount(Math.floor(current))
          }
        }, duration / steps)
        
        return () => clearInterval(timer)
      }
    }, [usersCountNumber, hasLoaded])
  
    useEffect(() => {
      if (inView && !hasLoaded) {
        setIsLoading(true)
        const loadStats = async () => {
          try {
            // Make direct API calls to get total counts
            const itemsResponse = await getProducts()
            const usersResponse = await getAllUsers()
            
            const itemsCount = itemsResponse.count || 0
            const usersCount = usersResponse.count || 0
            
            // Set fallback values if counts are 0 (for testing)
            const finalItemsCount = itemsCount > 0 ? itemsCount : 150 // Fallback for testing
            const finalUsersCount = usersCount > 0 ? usersCount : 50 // Fallback for testing
            
            setItemsCountNumber(finalItemsCount)
            setUsersCountNumber(finalUsersCount)
            setHasLoaded(true)
            controls.start("visible")
          } catch (error) {
            // Set fallback values if API fails
            setItemsCountNumber(150) // Fallback for testing
            setUsersCountNumber(50) // Fallback for testing
            setHasLoaded(true)
            controls.start("visible")
          } finally {
            setIsLoading(false)
          }
        }
        loadStats()
      }
    }, [inView, hasLoaded, controls])
  
    return (
      <motion.section
        ref={ref}
        className="relative py-20"
        variants={statsContainerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Gradient shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-primary/8 to-transparent dark:from-primary/12 dark:to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary mb-6"
             
            >
              <span className="text-sm font-semibold">{t('TrustedPlatform') || 'Trusted Platform'}</span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/80 dark:from-foreground dark:via-foreground dark:to-foreground/90 bg-clip-text "
              variants={shimmerVariants}
              animate="animate"
            >
              {t('JoinThousandsofHappySwapers') || 'Join Thousands of Happy Swappers'}
            </motion.h2>
          </motion.div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col items-center justify-center text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
              <motion.div
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div  
                className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              >
                <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            {isLoading || !hasLoaded ? (
              <div className="text-5xl md:text-7xl font-bold text-foreground dark:text-foreground">
                0
              </div>
            ) : (
              <motion.div 
                className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {displayUsersCount}+
              </motion.div>
            )}
            <motion.div
              className="text-base md:text-lg text-muted-foreground mt-4 font-semibold"
              variants={statsItemVariants}
            >
              {t('ActiveSwapers')|| 'Active Swappers'}
            </motion.div>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 1, duration: 0.8 }}
            />
          </motion.div>
  
          <motion.div
            className="flex flex-col items-center justify-center text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
              <motion.div
                className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              <motion.div
                className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              >
                <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            <motion.div 
              className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              99.9%
            </motion.div>
            <motion.div
              className="text-base md:text-lg text-muted-foreground mt-4 font-semibold"
              variants={statsItemVariants}
            >
              {t('SafeSwaps')||'Safe Swaps'}
            </motion.div>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </motion.div>
  
          <motion.div
            className="flex flex-col items-center justify-center text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
              <motion.div
                className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              <motion.div
                className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              >
                <Package className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            {isLoading || !hasLoaded ? (
              <div className="text-5xl md:text-7xl font-bold text-foreground dark:text-foreground">
                0
              </div>
            ) : (
              <motion.div 
                className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {displayItemsCount}+
              </motion.div>
            )}
            <motion.div
              className="text-base md:text-lg text-muted-foreground mt-4 font-semibold"
              variants={statsItemVariants}
            >
              {t('ItemsSwaps')||'Items Available'}
            </motion.div>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            />
            </motion.div>
          </div>
        </div>
      </motion.section>
    )
  }

  export default LazyStatsSection