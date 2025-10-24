"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Users, ShieldCheck, Package, Sparkles } from "lucide-react"
import { getProducts } from "@/callAPI/products"
import { getAllUsers } from "@/callAPI/users"
import axios from "axios"
import { baseItemsURL, baseURL } from "@/callAPI/utiles"
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
    const [itemsCountNumber, setItemsCountNumber] = useState(itemsCount || 0)
    const [usersCountNumber, setUsersCountNumber] = useState(usersCount || 0)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    const controls = useAnimation()
  
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
            
            console.log("Direct API Stats loaded:", { 
              itemsCount, 
              usersCount, 
              itemsData: itemsResponse.data, 
              usersData: usersResponse.data 
            })
            
            // Set fallback values if counts are 0 (for testing)
            const finalItemsCount = itemsCount > 0 ? itemsCount : 150 // Fallback for testing
            const finalUsersCount = usersCount > 0 ? usersCount : 50 // Fallback for testing
            
            setItemsCountNumber(finalItemsCount)
            setUsersCountNumber(finalUsersCount)
            setHasLoaded(true)
            controls.start("visible")
          } catch (error) {
            console.error("Error loading stats:", error)
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
        className="container pt-4 relative z-10"
        variants={statsContainerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
            variants={pulseVariants}
            animate="animate"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t('TrustedPlatform') || 'Trusted Platform'}</span>
          </motion.div>
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center mb-2"
            variants={shimmerVariants}
            animate="animate"
          >
            {t('JoinThousandsofHappySwapers') || 'Join Thousands of Happy Swapers'}
          </motion.h2>
        </motion.div>
  
        <div className="grid grid-cols-3 gap-6 md:gap-12">
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
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            {isLoading || !hasLoaded ? (
              <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
                ---
              </div>
            ) : (
              <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
                {usersCountNumber}
              </div>
            )}
            <motion.div
              className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
              variants={statsItemVariants}
            >
              {t('ActiveSwapers')|| 'Swapers'}
            </motion.div>
            <motion.div
              className="w-12 h-1 bg-secondary rounded-full mt-2"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
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
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
              99.9%
            </div>
            <motion.div
              className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
              variants={statsItemVariants}
            >
              {t('SafeSwaps')||'Safe Swaps'}
            </motion.div>
            <motion.div
              className="w-12 h-1 bg-secondary rounded-full mt-2"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
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
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Package className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </motion.div>
            </motion.div>
            {isLoading || !hasLoaded ? (
              <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
                ---
              </div>
            ) : (
              <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
                {itemsCountNumber}
              </div>
            )}
            <motion.div
              className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
              variants={statsItemVariants}
            >
              {t('ItemsSwaps')||'Items Swaps'}
            </motion.div>
            <motion.div
              className="w-12 h-1 bg-secondary rounded-full mt-2"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            />
          </motion.div>
        </div>
      </motion.section>
    )
  }

  export default LazyStatsSection